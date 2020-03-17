(function () {
    var example = d3.select("#example"),
        width = d3.getSize(example.style('width')),
        height = d3.getSize(example.style('height')),
        color = d3.scaleOrdinal(d3.schemeCategory10),
        world;

    d3.json("https://giottojs.org/geo/world-110m.json", function (error, w) {
        if (error) throw error;
        world = w;
        draw('svg');
    });

    const ren = {
        x: 0,
        y: 0,
        k: 1.2
    }

    const config = {
        templateSizeX: 300,
        templateSizeY: 300,
    }

    const mouse = {
        x: null,
        y: null,
        rX: null,
        rY: null
    }

    var deltaY = 0;
    const move = (ee) => {
        let x = mouse.rX + ((ee.clientX - mouse.x) * Math.pow(ren.k, .1)),
            y = mouse.rY + ((ee.clientY - mouse.y) * Math.pow(ren.k, .1));

        let maxX = width * ((ren.k - 1) / 2);
        if (x > maxX) { x = maxX }
        if (x < -maxX) { x = -maxX }
        ren.x = x;

        let kompY = ((width - height) * ren.k) / 16;
        console.log('%c kompY:', 'background: #ffcc00; color: #003300', kompY)
        let maxY = (height * ((ren.k - 1) / 2)) + kompY;
        if (y > maxY) { y = maxY }
        if (y < -maxY) { y = -maxY }
        ren.y = y;

        // console.log('%c xy:', 'background: #ffcc00; color: #003300', ren.x, ren.y)
    }

    document.getElementById("example").addEventListener("wheel", (e) => {
        deltaY += e.deltaY
        console.log('%c e.deltaZ:', 'background: #ffcc00; color: #003300', deltaY)
        let newDelY = 1 - (deltaY / 50);
        if (newDelY < 1) { newDelY = 1 }
        if (newDelY > 4) { newDelY = 4 }
        ren.k = newDelY;
    });
    document.getElementById("example").addEventListener("mousedown", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        console.log('%c e:', 'background: #ffcc00; color: #003300', e)
        mouse.rX = ren.x;
        mouse.rY = ren.y;


        document.getElementById("example").addEventListener('mousemove', move)
    });
    document.getElementById("example").addEventListener("mouseup", (e) => {
        console.log('%c eup:', 'background: #ffcc00; color: #003300', e)
        document.getElementById("example").removeEventListener('mousemove', move)

        // let x = (e.clientX - mouse.x) * Math.pow(ren.k, .1),
        //     y = (e.clientY - mouse.y) * Math.pow(ren.k, .1);

        // ren.x = mouse.rX + x;
        // ren.y = mouse.rY + y;
    });

    const day = document.getElementById('day');
    const wait = document.getElementById('wait');
    var index = 6;

    function draw() {
        example.select('.paper').remove();
        var paper = example
            .append('svg')
            .classed('paper', true)
            .attr('width', width).attr('height', height).canvasResolution(1).canvas(true)
            .attr("transform", "translate(" + ren.x + "," + ren.y + ")scale(" + ren.k + ")");

        var projection = d3.geoEckert3().scale(Math.min(180 * (width / 900), 300))
            .translate([width / 2, height / 2])
            .precision(.1);
        // console.log('%c  200 * (height / 600):', 'background: #ffcc00; color: #003300', 200 * (height / 600))

        var path = d3.geoPath().projection(projection),
            graticule = d3.geoGraticule();

        paper.append("path")
            .datum({ type: "Sphere" })
            .style("fill", "#000")
            .style('stroke', '#444')
            .style('stroke-width', '2px')
            .attr("d", path);

        paper.append("path")
            .datum(graticule)
            .style("fill", "none")
            .style("stroke", '#444')
            .style("stroke-width", '.5px')
            .style("stroke-opacity", 0.5)
            .attr("d", path);

        var countries = topojson.feature(world, world.objects.countries).features,
            neighbors = topojson.neighbors(world.objects.countries.geometries);

        paper.selectAll(".country")
            .data(countries)
            .enter()
            .insert("path", ".graticule")
            .attr("class", "country")
            .attr("d", path)
            .style("fill", "#222")

        paper.insert("path", ".graticule")
            .datum(topojson.mesh(world, world.objects.countries, function (a, b) {
                return a !== b;
            }))
            .style("fill", "none")
            .style("stroke", '#555')
            .style("stroke-width", (.5 / ren.k) + 'px')
            .attr("d", path);

        if (confirmed.have) { // && recovered.have && death.have) {
            p = [];
            for (let i = 1; i < confirmed.data[0].length; i++) {
                let long = confirmed.data[4][i],
                    lat = confirmed.data[3][i],
                    lx = Number(long.replace(',', '.')),
                    ly = Number(lat.replace(',', '.'));
                sum = 0;
                // for (let j = 5; j < index; j++) {
                //     let qua = confirmed.data[j][i];
                //     if (qua) {
                //         sum += Number(qua)
                //     }
                // }

                sum = Number(confirmed.data[index][i]);

                let pos = [lx, ly, (Math.sqrt(Math.sqrt(sum))) * 6];
                p.push(pos);
                // console.log((pos));

            }

            paper.selectAll("confirmedData")
                .data(p).enter()
                .append("circle")
                .attr("cx", d => projection(d)[0])
                .attr("cy", d => projection(d)[1])
                .attr("r", d => (d[2] / ren.k) + 'px')
                .attr("fill", "rgb(255, 0, 0, .6)")
            // .style("stroke-width", (.5 / ren.k) + 'px')
            // .attr("stroke", "black")



            // paper.selectAll("confirmedData")
            //     .data(p).enter()
            //     .append("rect")
            //     .attr("x", d => projection(d)[0])
            //     .attr("y", d => projection(d)[1])
            //     .attr("width", d => d[2])
            //     .attr("height", d => d[2])
            //     .attr("fill", "red")
            //     .style("stroke-width", (.3 / ren.k) + 'px')
            //     .attr("stroke", "black");

        }
        let dayNum = confirmed.data[index][0].split('/');
        let month;
        switch (dayNum[0]) {
            case '1': month = 'January'; break;
            case '2001': month = 'January'; break;
            case '2': month = 'February'; break;
            case '2002': month = 'February'; break;
            case '3': month = 'March'; break;
            case '2003': month = 'March'; break;
        }


        let dayTxt = '2020 ' + month + ' ' + dayNum[1];

        day.innerHTML = dayTxt;
    }

    var index = 5;
    var frame = 2;
    const getData = (arr, url) => {
        axios.get(url)
            .then(function (response) {
                // console.log(response.data.feed.entry);
                let data = response.data.feed.entry;
                let encja = 'gs$cell';
                let maxCol = 0,
                    maxRow = 0;
                for (let d of data) {
                    if (d[encja]) {
                        let col = Number(d[encja].col),
                            row = Number(d[encja].row);
                        if (col > maxCol) { maxCol = col }
                        if (row > maxRow) { maxRow = row }
                    }
                }
                // console.log('%c maxCol, maxRow:', 'background: #ffcc00; color: #003300', maxCol, maxRow)

                for (let i = 0; i < maxCol; i++) {
                    arr.data[i] = [];
                    for (let j = 0; j < maxRow; j++) {
                        arr.data[i][j] = null;
                    }
                }
                // console.log('%c arr:', 'background: #ffcc00; color: #003300', arr)

                for (let d of data) {
                    if (d[encja]) {
                        let col = Number(d[encja].col) - 1,
                            row = Number(d[encja].row) - 1,
                            inp = d[encja].inputValue;
                        arr.data[col][row] = inp;
                    }
                }

                arr.have = true
            })
            .catch(function (error) {
                console.log(error);
            })
            .then(function () { });
    }

    let confirmed = { data: [], have: false };
    // recovered = { data: [], have: false },
    // death = { data: [], have: false };

    getData(confirmed, 'https://spreadsheets.google.com/feeds/cells/16B0A_DaX2oevMdUlJUZA_k0tSn_Q-amCTHnLRo1tNpo/1/public/full?alt=json')
    // getData(recovered, 'https://spreadsheets.google.com/feeds/cells/16B0A_DaX2oevMdUlJUZA_k0tSn_Q-amCTHnLRo1tNpo/2/public/full?alt=json')
    // getData(death, 'https://spreadsheets.google.com/feeds/cells/16B0A_DaX2oevMdUlJUZA_k0tSn_Q-amCTHnLRo1tNpo/3/public/full?alt=json')


    var show = () => {
        draw('svg');
        frame--;
        if (!frame) {
            wait.style.display = 'none';
            index++;
            console.log('%c index:', 'background: #ffcc00; color: #003300', index)
            // console.log('%c index:', 'background: #ffcc00; color: #003300', index)
            if (index > confirmed.data.length - 1) {
                index = 5;
                clearInterval(animation);
                setTimeout(() => {
                    animation = setInterval(show, 120, index);
                }, 3000);
            }
            frame = 2
        }
    }

    var animation = setInterval(show, 120, index);


    window.onload = () => {
        let waitForData = setInterval(() => {
            if (confirmed.have) { // && recovered.have && death.have) {
                // console.log('%c confirmed:', 'background: #ffcc00; color: #003300', confirmed)
                // console.log('%c recovered:', 'background: #ffcc00; color: #003300', recovered)
                // console.log('%c death:', 'background: #ffcc00; color: #003300', death)


                clearInterval(waitForData)

                show();
            }

        }, 100, index);
    }
}());