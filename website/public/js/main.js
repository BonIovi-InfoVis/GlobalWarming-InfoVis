var pages = ['landing.html', 'js/globeEmissions/index.html', 'js/globeTemp/index.html', 'js/tempRise/index.html', 'js/tempEmissionCorrelation/index.html', 'js/iceMassRecession/index.html', 'js/seaLevel/index.html', 'js/emissionsAndEfforts/index.html'];
var current = 0;
var descriptions = ['', 
 'This chart shows the Carbon-dioxide emissions by country and over the years. Simply hover the mouse on the timeline to show the emission values on the globe and rotate the globe freely by right-click and drag. You can even zoom in and out with the mouse wheel. The loading process may take a while since the data in on a 2x2 degrees grid.',
 'Similar to the provious chart, this one shows a far more alarming dataset: the temperature anomaly over the years by geographic area. The anomaly is the difference of temperature from the average taken from 1951 and 1980. The chart shows how this anomaly is spread all over the globe, but highly concentrated on the poles, and rising over the years. ',
 'This animated chart shows basically the same data as the previous one but from a different perspective, showing how the anomamaly is progressing month by month over the years, without considering the geographic position. The color of the animated line transitions from green to red with the progression of the timeline, while the temperature in indicated on the radius of the circle, with each radius indicating a month of the year. The current year is indicated in the center and hovering the mouse on the edges shows the exact temperature value. ', 
 'This chart shows how emissions and temperature rise are correlated, with both increasing over the years. The red line shows the temperature rise, with the opaque one being more precise (monthly anomaly) and the darker one being an average year by year. Emission data is on the blue line and we only used the percentage increase to have it comparable with the temperature. We also only used the seasonal cycle average to exclude the periodic component from the curve. ',
 'This simple chart shows the first critial consequence of global warming. Ice mass is drastically decreasing over the years because of the temperature anomaly that, as we\'ve seen, is focused on the poles. Greenland, as well as Antartica, is losing ice mass over the years, and being it land ice, it is also causing the sea level rise and contributing to the temperature anomaly itself. It\'s also worth noting that every ice mass level is at its historical minimum.',
 'This animated chart indicates how the worldwide sea level is rising over the years. Clicking on the circle will advance in time and update the written data and the water level itself. The reference data was calculated with the average from XXXX to XXXX. ',
 'This last chart is also quite dramatic. It shows the political events regarding the efforts to reduce pollution with the purpose of fighting climate change. Not only there are some negative events (marked with red dots), but the chart also shows that every effort taken until now has basically no effect on the global emissions. Hovering the mouse on the dots will show the name of the event. '  ];
var titles = ['', 'Carbon-Dioxide Emissions', 'Temperature Anomaly', 'Global Average Temperature Anomaly', 'Emissions and Temperature Rise Correlation', 'Greenland Ice Mass Recession', 'Sea Level Rise', 'Political Efforts'];


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
var changeButton = function() {
    if(current % pages.length == pages.length - 1)
        $('.next').text("start over");
    else $('.next').text("Learn more »");
}

$(document).ready(function() {
    loadIframe();
    changeText();
    $(".next").click(function() {
        increment();
        loadIframe();
        changeText();
        changeButton();
    });
});
