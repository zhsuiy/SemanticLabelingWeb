// split images

var global = require('./global')

var groupnum = global.groupnum;
var allimagepath = global.allimagepath;
var imagedir = global.imagedir;
var groupname = global.groupname;

var fs = require('fs');

for (var i = 0;i < groupnum; i++)
{
    var dirname = imagedir + groupname + i;
    if (!fs.existsSync(dirname)){
        fs.mkdirSync(dirname);
    }
}

// read image file names
var files = [];
var path = require('path');
var allImgNum = 0, eachGrpImgNum = 0;
fs.readdir(allimagepath, function(err,list){
    if(err) throw err;
    for(var i=0; i<list.length; i++)
    {       
        console.log(list[i]); //print the file
        files.push(list[i]); //store the file name into the array files        
    }

    allImgNum = files.length;
    eachGrpImgNum = allImgNum / groupnum;
    console.log(eachGrpImgNum);
    var imgid = 0;
    for (var i = 0;i < groupnum;i++)
    {        
        for (var j = 0; j < eachGrpImgNum;j++)
        {
            if (imgid < allImgNum)
            {
                var src = allimagepath + '/' + files[imgid];
                var des = imagedir + groupname + i + '/' + files[imgid];
                fs.createReadStream(src).pipe(fs.createWriteStream(des));
                imgid++;
            }
            else
                break;            
        }    
    }   

});














