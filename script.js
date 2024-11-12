var defaultLatitude = 52.2297;
var defaultLongitude = 21.0122;
var defaultZoom = 13;
var map;

var userLatitude;
var userLongitude;
var userMarker;
var isSolution = 0;

var squares = [
    { x: 0, y: 0, index: 0, pos: 0 },
    { x: 100, y: 0, index: 1, pos: 0  },
    { x: 200, y: 0, index: 2, pos: 0  },
    { x: 300, y: 0, index: 3, pos: 0  },

    { x: 0, y: 100, index: 4, pos: 0  },
    { x: 100, y: 100, index: 5, pos: 0  },
    { x: 200, y: 100, index: 6, pos: 0 },
    { x: 300, y: 100, index: 7, pos: 0  },

    { x: 0, y: 200, index: 8, pos: 0  },
    { x: 100, y: 200, index: 9, pos: 0 },
    { x: 200, y: 200, index: 10, pos: 0  },
    { x: 300, y: 200, index: 11, pos: 0  },

    { x: 0, y: 300, index: 12, pos: 0  },
    { x: 100, y: 300, index: 13, pos: 0  },
    { x: 200, y: 300, index: 14, pos: 0  },
    { x: 300, y: 300, index: 15, pos: 0  }
];

function askCoordinates() {
    navigator.geolocation.getCurrentPosition(
        function (position) {
            this.userLatitude = position.coords.latitude;
            this.userLongitude = position.coords.longitude;

            this.map.setView([this.userLatitude, this.userLongitude], defaultZoom);
            userMarker = L.marker([this.userLatitude, this.userLongitude]).addTo(map);
        }
    )
}

function loadMapDefault(){
    this.map = L.map('map').setView([defaultLatitude, defaultLongitude], defaultZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    userMarker = L.marker([defaultLatitude, defaultLongitude]).addTo(map)
        .bindPopup('Warszawa, Polska')
        .openPopup();
}

function askPopups(){
    Notification.requestPermission().then(permission =>{});
}

function userCoordinates(){
    map.removeLayer(userMarker);
    this.map.setView([this.userLatitude, this.userLongitude], defaultZoom);
    userMarker = L.marker([this.userLatitude, this.userLongitude]).addTo(map);

    console.log(this.userLatitude);
    console.log(this.userLongitude);
}

function sendNotification(text){
    if (Notification.permission === 'granted')
    {
        const notification = new Notification("Powiadomienie", {
            body: text,
        });
    }
}

function saveRasterMap() {
    map.removeLayer(userMarker);
    leafletImage(map, function (err, canvas) {
        var rasterMapImage = document.createElement("img");
        var mapDimensions = map.getSize();
        rasterMapImage.width = mapDimensions.x;
        rasterMapImage.height = mapDimensions.y;
        rasterMapImage.src = canvas.toDataURL();
        document.getElementById("mapImage").innerHTML = '';
        document.getElementById("mapImage").appendChild(rasterMapImage);

        puzzle(canvas);
    });
    userMarker = L.marker([this.userLatitude, this.userLongitude]).addTo(map);
    document.getElementById("puzzleResult").innerHTML = '';
    isSolution = 0;
}

function puzzle(canvas){
    var puzzlePlayground = document.getElementById("puzzlePlayground");
    puzzlePlayground.innerHTML = '';

    var mapDimensions = map.getSize();
    var width = mapDimensions.x;
    var height = mapDimensions.y;



    ////// 16 kwadratow
    var squareWidth = width / 4;
    var squareHeight = height / 4;

    var squares = [
        { x: 0, y: 0, index: 0 },
        { x: squareWidth, y: 0, index: 1},
        { x: squareWidth * 2, y: 0, index: 2 },
        { x: squareWidth * 3, y: 0, index: 3 },

        { x: 0, y: squareHeight, index: 4  },
        { x: squareWidth, y: squareHeight, index: 5  },
        { x: squareWidth * 2, y: squareHeight, index: 6  },
        { x: squareWidth * 3, y: squareHeight, index: 7  },

        { x: 0, y: squareHeight * 2, index: 8  },
        { x: squareWidth, y: squareHeight * 2, index: 9  },
        { x: squareWidth * 2, y: squareHeight * 2, index: 10  },
        { x: squareWidth * 3, y: squareHeight * 2, index: 11  },

        { x: 0, y: squareHeight * 3, index: 12  },
        { x: squareWidth, y: squareHeight * 3, index: 13  },
        { x: squareWidth * 2, y: squareHeight * 3, index: 14  },
        { x: squareWidth * 3, y: squareHeight * 3, index: 15  },
    ];


    var puzzleResult = document.getElementById("puzzleResult");


    var shuffleSquares = squares.sort(() => Math.random() - 0.5);

    shuffleSquares.forEach((position, index) => {
        var squareCanvas = document.createElement("canvas");
        squareCanvas.id = position.index;
        squareCanvas.width = squareWidth;
        squareCanvas.height = squareHeight;

        var draw = squareCanvas.getContext("2d");

        draw.drawImage(canvas, position.x, position.y, squareWidth, squareHeight, 0, 0, squareWidth, squareHeight);
        squareCanvas.draggable = true;

        squareCanvas.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text/plain", position.index);
        });

        puzzlePlayground.appendChild(squareCanvas);
    });


    puzzleResult.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    puzzleResult.addEventListener("drop", (event) => {
        event.preventDefault();

        var element = event.dataTransfer.getData("text/plain");

        var draggedElement = document.getElementById(element);
        var target = event.target;

        if (target.tagName != "CANVAS"){
            var targetPosition = target.getBoundingClientRect();

            var column = Math.floor((event.clientX - targetPosition.left) / (targetPosition.width / 4));
            var row = Math.floor((event.clientY - targetPosition.top) / (targetPosition.height / 4));
            var x = Math.floor(column * (targetPosition.width / 4));
            var y = Math.floor(row * (targetPosition.height / 4));

            if (x === 201 || x === 301){
                x--;
            }

            if (y === 201 || y === 301){
                y--;
            }

            draggedElement.style.position = "absolute";
            draggedElement.style.left = `${x}px`;
            draggedElement.style.top = `${y}px`;

            target.appendChild(draggedElement);
            positionCheck(x, y, draggedElement.id, target.id);
        }
    });

    puzzlePlayground.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    puzzlePlayground.addEventListener("drop", (event) => {
        event.preventDefault();

        var element = event.dataTransfer.getData("text/plain");

        var draggedElement = document.getElementById(element);
        var target = event.target;

        if (target.tagName != "CANVAS"){
            var targetPosition = target.getBoundingClientRect();

            var column = Math.floor((event.clientX - targetPosition.left) / (targetPosition.width / 4));
            var row = Math.floor((event.clientY - targetPosition.top) / (targetPosition.height / 4));
            var x = Math.floor(column * (targetPosition.width / 4));
            var y = Math.floor(row * (targetPosition.height / 4));

            if (x === 201 || x === 301){
                x--;
            }

            if (y === 201 || y === 301){
                y--;
            }

            draggedElement.style.position = "absolute";
            draggedElement.style.left = `${x}px`;
            draggedElement.style.top = `${y}px`;


            target.appendChild(draggedElement);
            positionCheck(x, y, draggedElement.id, target.id);
        }
    });

}

function positionCheck(x, y, index, targetID){
    var result = squares.find(item => item.x === x && item.y === y);
    var resultID = squares.find(item => item.index === Number(index));


    if (resultID.pos === 1){
        resultID.pos = 0;
        isSolution = isSolution - 1;
        if (targetID === "puzzlePlayground"){
            return;
        }
        console.log("Niepoprawne ułożenie");
        return;
    }

    if (targetID === "puzzlePlayground"){
        return;
    }

    if (result.index === Number(index)){
        console.log("Poprawne ułożenie");
        result.pos = 1;
        isSolution++;
    }
    else {
        console.log("Niepoprawne ułożenie");
    }

    if (isSolution === 16){
        sendNotification("Brawo!!! Udało si cię ułożyć obraz");
        console.log("Wszystkie puzzle zostały ułożone poprawnie!");
    }
}



window.onload = function() {
    loadMapDefault();
    askCoordinates();
    askPopups();
}