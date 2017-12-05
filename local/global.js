var fs = require('fs');
var path = require('path');

var groupnum = 10;
var allimagepath = './allimages';
var imagedir = '../public/images/';
var groupname = 'group-';
var wordarr = [];
var tutorials = [];

(function readWords(/*callback*/) {
    //参数1 文件的名字，参数2 编码格式 参数3 回调函数
    var filepath = path.join(__dirname, '..', 'public', 'config', 'guidewords');
    // console.log(filepath);
    fs.readFile(filepath, 'utf-8', function (err, data) {
        if (err) {
            console.error(err);
        } else {
            console.log(data);
           // callback(data);
            wordarr.length = 0;
            var tmpwordarr = data.toString().split("\n");
            for (var i = 0, len = tmpwordarr.length; i < len; i++) 
            {
                if (tmpwordarr[i].length === 0)
                    continue;
                if (tmpwordarr[i][0] === '#')
                    continue;
                wordarr.push(tmpwordarr[i]);
            }
            console.log('wordarr: ' + wordarr.length);
        }
    })
})();

const isDirectory = source => fs.lstatSync(source).isDirectory();
const isFile = source => fs.lstatSync(source).isFile();
const getDirectories = source => fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory);
const getFiles = source => fs.readdirSync(source).map(name => path.join(source, name)).filter(isFile);

(function readCarousel() {
    var folder = path.join(__dirname, '..', 'public', 'tutorials');
    var subfolders = getDirectories(folder);
    subfolders.forEach(dir => {
        var files = getFiles(dir);
        var tId = path.basename(dir);
        var urls = [];
        files.forEach(file => {
            var url = path.join('tutorials', tId, path.basename(file));
            urls.push(url);
        });
        tutorials.push({tId, urls});
    });
    // console.log(tutorials);
})();

module.exports = 
{
    allimagepath,
    groupnum,
    groupname,
    imagedir,
    wordarr,
    tutorials
};