var pages = ['landing.html', 'js/globeEmissions/index.html', 'js/globeTemp/index.html', 'js/iceMassRecession/index.html', 'js/seaLevel/index.html', 'js/tempRise/index.html'];
var current = 0;
var descriptions = ['', 'prova'];
var titles = ['', 'prova'];


var increment = function() {
    current++;
}
var loadIframe = function() {
    $('.iframe').attr('src', pages[current % pages.length]);
}
var changeText = function() {
    $('.title').text(titles[current % titles.length]);
    $('.description').text(descriptions[current % descriptions.length]);
}

$(document).ready(function() {
    loadIframe();
    changeText();
    $(".next").click(function() {

        increment();
        loadIframe();
        changeText();
    });
});
