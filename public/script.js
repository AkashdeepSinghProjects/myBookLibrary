$(".bookNote ,.review").click(function(e){
   this.contentEditable = true;
   $(this).on('keypress blur',function(e){
    
    if(e.keyCode&&e.keyCode==13||e.type=='blur'){
        this.contentEditable = false;
        var data = {bookId:$(this).attr('id')};
        data[$(this).attr('class')]= $(this).text();

        $.ajax({
            url:"/editNote",
            type:"post",
            data:data
          });
    }
   });
});
$(".sortIcon").click(function(){
    $(this).toggleClass("sortDec");
    $(this).toggleClass("sortInc");
    if($(this).hasClass("sortDec")){
        $("#incOrDec").attr("value","DESC");
    }else{
        $("#incOrDec").attr("value","ASC");
    }
})