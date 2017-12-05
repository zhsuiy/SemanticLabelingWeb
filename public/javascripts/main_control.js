/**
 * Created by Cloud on 14-5-7.
 */



    $(document).ready(function(){
        $('input[type=file]').bootstrapFileInput();
        $("#warning-upload1").hide();
        $("#warning-upload2").hide();
        $("p.OpenedFile").hide();
        $("p.OpenedAudio").hide();
        });



    $(function(){

        //判断是否有打开文件
        var AlreadyUpload = false;

        //打开了和上次不同的文件
        $('#btn-upload').change(function(){
        AlreadyUpload = true;
        //content以后要替换成服务端返回的图片路径
        //var content =  $("#btn-upload").val();
        // $("img.OpenedFile").attr("src",content);

        $("p.OpenedFile").hide();
        $("p.OpenedAudio").hide();

        var content = $("#btn-upload").val();
        var suffix = content.split('.').pop().toLowerCase();

        if($.inArray(suffix, ['jpg'])===0) {
        $("p.OpenedFile").slideDown('slow');
        }
    else if($.inArray(suffix, ['wav'])===0){
        $("p.OpenedAudio").slideDown('slow');
        }
    else
                {
                    $("#warning-upload2").slideDown('slow');
                    }
    });

    // 点击页面其他地方使warning消失
    $("body").click(function(){
        $("#warning-upload1").slideUp('slow');
        $("#warning-upload2").slideUp('slow');

        });

    //提交表单的验证
    $("[type='submit']").click(function(){

        if(AlreadyUpload){
        var content = $("#btn-upload").val();
        var suffix = content.split('.').pop().toLowerCase();
        if($.inArray(suffix, ['jpg',,'wav']) === -1) {
        $("#warning-upload2").slideDown('slow');
        return false;
        }
    else
                    {
                        $('form').submit();
                        }
    }
    else
                {
                    $("#warning-upload1").slideDown('slow');
                    return false;
                    }
    });

    });




    if(window.name != "main"){
        location.reload();
        window.name = "main";
    }
    else{
        window.name = "";
    }


