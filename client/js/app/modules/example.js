console.log("engine");
define('engine', function() {
    function showModule() {
        alert('hello from module!');
    }
 
    return {
        showModule: showModule
    };
});
