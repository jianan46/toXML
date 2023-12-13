const http = require("node:http");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const { toXML } = require("./module/toxml");
const address = require('address')

const hostname = address.ip()
const port = 3000;
const os = require("os");

const server = http.createServer(async (req, res) => {
  if (req.url === "/toxml" && req.method.toLowerCase() == "post") {
    const form = new formidable.IncomingForm({
      uploadDir: __dirname,
      keepExtensions: true,
      allowEmptyFiles: true,
      minFileSize: 0,
    });
    let fields;
    let files;

    try {
      [fields, files] = await form.parse(req);
    } catch (err) {
      // example to check for a very specific error
      if (err.code === formidableErrors.maxFieldsExceeded) {
      }
      console.error(err);
      res.writeHead(err.httpCode || 400, { "Content-Type": "text/plain" });
      res.end(String(err));
      return;
    }

    let originalFilename =
      files.xmlFile[0].originalFilename || "Map Remote.xml";
    let xmlPiece = fields.xmlPiece[0];
    if (xmlPiece.trim().length === 0) {
      res.setHeader("Content-Type", "text/html;charset=utf-8");
      res.end(`
        <h3>您的输入有误请重试</h3>
        <a href="/">返回上一页</a>
      `);
      return;
    }
    let insertText = toXML(xmlPiece);
    let string;
    let filePath;
    if (files.xmlFile[0].size === 0) {
      filePath = path.join(__dirname, files.xmlFile[0].newFilename);
      let stringArr = [
        "<?xml version='1.0' encoding='UTF-8' ?>",
        "<?charles serialisation-version='2.0' ?>",
        "<map>",
        "<toolEnabled>true</toolEnabled>",
        "<mappings>",
        insertText,
        "</mappings>",
        "</map>",
      ];
      string = stringArr.join(os.EOL);
    } else {
      filePath = path.join(__dirname, files.xmlFile[0].newFilename);
      let temp = fs.readFileSync(filePath).toString();
      let index = temp.lastIndexOf("</mappings>");
      let head = temp.slice(0, index);
      let tail = temp.slice(index);
      string = head + insertText + tail;
    }

    fs.writeFileSync(filePath, string);
    const f = fs.createReadStream(filePath);
    res.writeHead(200, {
      "Content-Type": "application/force-download", // 固定写法
      "Content-Disposition": `attachment; filename=${originalFilename}`, // attachment实现跨域，filename设置文件名
    });
    f.pipe(res);
    fs.unlink(filePath, () => {
      console.log("删除成功");
    });
    return;
  }

  res.setHeader("Content-Type", "text/html;charset=utf-8");
  res.end(`
    <h2>Charles tool</h2>
    <form action="/toxml" method="post" enctype="multipart/form-data" id="xmlForm">
      <div>选择在charles导出的xml文件(不选将创建新文件)：<input type="file" accept=".xml" name="xmlFile" /></div>
      <br/>
      <div><textarea type="text" name="xmlPiece" cols="150" rows="10" placeholder="填入从charles复制出来的要添加的代理..."></textarea><div>
      <br/>
      <input type="submit"/>
    </form>
  `);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
