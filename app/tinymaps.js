import 'intersection-observer';
import * as d3 from 'd3';
import * as d3tooltip from 'd3-tooltip';
import * as topojson from 'topojson';
import iacounties from '../sources/ia_counties.json';

class Map {

    constructor(target, candidate) {
        this.target = target;
        this.candidate = candidate;
        this.svg = d3.select(target + " svg").attr("width", $(target).outerWidth()).attr("height", $(target).outerHeight());
        this.g = this.svg.append("g");
        this.zoomed = false;
        this.scaled = $(target).width() / 520;
        this.colorScale = ['#8CBF82','#DEA381','#80ADAD','#7D739C','#F2614C','#636363','##969696','#969696','#969696','#969696','#969696','#969696']
    }

    /********** PRIVATE METHODS **********/

    // Detect if the viewport is mobile or desktop, can be tweaked if necessary for anything in between
    _detect_mobile() {
        var winsize = $(window).width();

        if (winsize < 520) {
            return true;
        } else {
            return false;
        }
    }

    /********** PUBLIC METHODS **********/

    // Render the map
    render() {
        var self = this;

        var projection = d3.geoAlbers().scale(7337).translate([-50, 700]);


        var width = $(self.target).outerWidth();
        var height = $(self.target).outerHeight();
        var centered;

        var path = d3.geoPath(projection);

        var svg = d3.select(self.target + " svg").attr("width", width).attr("height", height);
        var tooltip = d3tooltip(d3);

        // self._render_legend();

        // Only fire resize events in the event of a width change because it prevents
        // an awful mobile Safari bug and developer rage blackouts.
        // https://stackoverflow.com/questions/9361968/javascript-resize-event-on-scroll-mobile
        var cachedWidth = window.innerWidth;
        d3.select(window).on("resize", function() {
            var newWidth = window.innerWidth;
            if (newWidth !== cachedWidth) {
                cachedWidth = newWidth;
            }
        });

        var tooltip = function(accessor) {
            return function(selection) {
                var tooltipDiv;
                var bodyNode = d3.select('body').node();
                selection.on("mouseover", function(d, i) {
                        // Clean up lost tooltips
                        d3.select('body').selectAll('div.tooltip').remove();
                        // Append tooltip
                        tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
                        // var absoluteMousePos = d3.mouse(bodyNode);
                        // console.log(d3.event.pageX);
                        // console.log(absoluteMousePos);
                        tooltipDiv.style('left', (d3.event.pageX + 10) + 'px')
                            .style('top', (d3.event.pageY - 15) + 'px')
                            .style('position', 'absolute')
                            .style('z-index', 1001);
                        // Add text using the accessor function
                        var tooltipText = accessor(d, i) || '';

                        tooltipDiv.html(tooltipText);
                        $("#tip").html(tooltipText);

                        if (self._detect_mobile() == true) {
                            $("#tip").show();
                            // $(".key").hide();
                        }
                        // Crop text arbitrarily
                        //tooltipDiv.style('width', function(d, i){return (tooltipText.length > 80) ? '300px' : null;})
                        //    .html(tooltipText);
                    })
                    .on('mousemove', function(d, i) {
                        // Move tooltip
                        tooltipDiv.style('left', (d3.event.pageX + 10) + 'px')
                            .style('top', (d3.event.pageY - 15) + 'px');

                    })
                    .on("mouseout", function(d, i) {
                        // Remove tooltip
                        tooltipDiv.remove();
                        $("#tip").hide();
                        // $(".key").show();
                        $("#tip").html("");
                    }).on("mouseleave", function() {
                        $(".shifter").removeClass("arrowselect");
                    });

            };
        };

        self.g.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(iacounties, iacounties.objects.convert).features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", function(d) {
                return "county C" + d.properties.COUNTYFP;
            })
            .attr("id", function(d) {
                return "P" + d.properties.COUNTYFP;
            })
            .style("stroke-width", '1')
            .style("stroke", "#ffffff")
            .style("fill", function(d) {
                return self.colorScale[self.candidate];
            })
            .call(tooltip(function(d, i) {
                return "<div class='countyName'>" + d.properties.NAMELSAD + "</div><div class='number'><span class='legendary' style='color; background-color:" + self.colorScale[self.candidate] + ";'>VOTES</div>";
              }));


        var aspect = 500 / 300,
            chart = $(self.target + " svg");
        var targetWidth = chart.parent().width();
        chart.attr("width", targetWidth);
        chart.attr("height", targetWidth / aspect);
        if ($(window).width() <= 520) {
            $(self.target + " svg").attr("viewBox", "0 0 500 550");
        }

        $(window).on("resize", function() {
            targetWidth = chart.parent().width();
            chart.attr("width", targetWidth);
            chart.attr("height", targetWidth / aspect);
        });
    }
}

export {
    Map as
    default
}