var data = {};

var index = 0;
var groups;
var panel;
var err;

String.prototype.format = function()
{
    var args = arguments;
    return this.replace(/\{(\d+)\}/g,
        function(m, i){
            return args[i];
        });
};

$.fn.preventDoubleSubmission = function() {
    $(this).on('submit',function(e){
        var $form = $(this);

        if ($form.data('submitted') === true) {
            // Previously submitted - don't submit again
            e.preventDefault();
        } else {
            // Mark it so that the next submit can be ignored
            $form.data('submitted', true);
        }
    });

    // Keep chainability
    return this;
};

function loadImages() {
    panel = $('#content-panel');
    panel.addClass("text-center");
    groups = $.parseJSON($('#groups').html());
    err = $('#error');
    getGroup();
}

function getGroup(){
    panel.empty();
    err.hide();
    $('body').scrollTop(0);

    var description = "";
    var key = groups[index].key;
    var splits = key.split('-');
    if(splits.length == 3){
        description = splits[2];
    }

    var value = groups[index].value;
    $('#description').html(description);

    for(var i in value){
        var src = value[i];
        var html = "\
        <div class='btn-group' data-toggle='buttons'>\
            <p>\
            <img src='{0}' width='700px' height='400px' alt='...' class='img-rounded'>\
            </p>\
            <p>\
            <div class='container'>\
            <div class='row'>\
                <strong class='col-md-1 text-center'> Least {1} </strong>\
                <label class='btn col-md-2'>\
                    <input type='radio' name='{0}' value='1'> <span> 1 </span>\
                </label>\
                <label class='btn col-md-2'>\
                    <input type='radio' name='{0}' value='2'> <span> 2 </span>\
                </label>\
                <label class='btn col-md-2'>\
                    <input type='radio' name='{0}' value='3'> <span> 3 </span>\
                </label>\
                <label class='btn col-md-2'>\
                    <input type='radio' name='{0}' value='4'> <span> 4 </span>\
                </label>\
                <label class='btn col-md-2'>\
                    <input type='radio' name='{0}' value='5'> <span> 5 </span>\
                </label>\
                <strong class='col-md-1 text-center'> Most {1} </strong>\
            </div>\
            </div>\
            </p>\
        </div>";
        panel.append(html.format(src, description));
    }
    if(index + 1 >= groups.length){
        $('#nextBtn').hide();
        $('#submitBtn').show();
    }
}

function next(){
    if(record()) {
        err.empty();
        err.hide();
        index++;
        getGroup();
    }
    else{
        err.show();
        err.html("You haven't finish the questions.");
    }
}

function record(){
    var key = groups[index].key;
    var value = groups[index].value;
    for(var i in value){
        var groupId = value[i];
        var check = $("input[name='{0}']:checked".format(groupId)).val();
        if(check === undefined){
            return false;
        }
        else{
            var filename = groupId.replace(/^.*[\\\/]/, '').split('.')[0];
            var k = "{0}-{1}".format(key, filename);
            data[k] = check;
        }
    }
    return true;
}

function submit(){
    if(record()) {
        err.empty();
        err.hide();

        var form = $('<form/>', {action:'/result', method:'post'}).append(
            $('<input/>', {type:'hidden', name:'data', value:JSON.stringify(data)})
        );
        form.preventDoubleSubmission();
        form.submit();
    }
    else{
        err.show();
        err.html("You haven't finish the questions.");
    }
}

window.onload = loadImages;