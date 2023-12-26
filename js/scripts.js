// SIDEBAR OPEN

var sidebarOpen = false;
var sidebar = document.getElementById("sidebar");

function openSidebar() {
    if (!sidebarOpen) {
        sidebar.classList.add("sidebar-responsive");
        sidebar = true;
    }
}

function closeSidebar() {
    if (sidebarOpen) {
        sidebar.classList.remove("sidebar-responsive");
        sidebar = false;
    }
}
//-------Firebase------//
// Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAq4QBggIBtmUBI2PXVycY2aSCKbvNnZWM",
    authDomain: "esp32-243e9.firebaseapp.com",
    databaseURL: "https://esp32-243e9-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "esp32-243e9",
    storageBucket: "esp32-243e9.appspot.com",
    messagingSenderId: "693153123783",
    appId: "1:693153123783:web:5302d29c2cc3377ad35de2"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// getting reference to the database
var database = firebase.database();

//getting reference to the data we want
var dataRef1 = database.ref('Variable/Bat_Hum');
var dataRef2 = database.ref('Variable/Bat_Temp');
var dataRef3 = database.ref('Variable/Voltage');
var dataRef4 = database.ref('Variable/speed');
var dataRef5 = database.ref('Variable/latitude');
var dataRef6 = database.ref('Variable/longitude');

//fetch the data
dataRef1.on('value', function (getdata1) {
    var humi = getdata1.val();
    document.getElementById('humidity').innerHTML = humi + "%";
})

dataRef2.on('value', function (getdata2) {
    var temp = getdata2.val();
    document.getElementById('temperature').innerHTML = temp + "&#8451;";
})

dataRef3.on('value', function (getdata3) {
    var vol = getdata3.val();
    var percentage = vol/8.4 * 100;
    document.getElementById('voltage').innerHTML = percentage.toFixed(2) + "%";
})

dataRef4.on('value', function (getdata4) {
    var speed = getdata4.val().toFixed(1);
    document.getElementById('speed').innerHTML = speed + "km/h";
})


//-------CHARTS--------//
//generate line chart

//getting server time from firebase
var serverTimeRef = firebase.database().ref('/.info/serverTimeOffset');

function updatechart(data1) {
    serverTimeRef.on('value', function (snapshot) {
        var serverTime = snapshot.val();
        // Convert the server time to a Date object
        var epoch = Date.now(serverTime);
        var timestamp = new Date(epoch);
        timestamp = timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
        // Update your voltage level chart using the new server time

        // Update the chart data
        voltageLevelChart.data.labels.push(timestamp);
        voltageLevelChart.data.datasets[0].data.push(data1);

        // Limit the number of data points displayed on the chart
        const maxDataPoints = 10;
        if (voltageLevelChart.data.labels.length > maxDataPoints) {
            voltageLevelChart.data.labels.shift();
            voltageLevelChart.data.datasets[0].data.shift();
        }
        // Redraw the chart
        voltageLevelChart.update();
    });
}

// Get voltage level from firebase
firebase.database().ref('Variable/Voltage').on('value', function (snapshot) {
    var data1 = snapshot.val();
    updatechart(data1);
});

// Create a chart using Chart.js
var ctx = document.getElementById('voltageLevelChart').getContext('2d');
var voltageLevelChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Voltage Level',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
        }]
    },
    options: {
        scales: {
            x: [{
                type: 'linear',
            }],
            y: {
                min: 0,
                max: 10,
                ticks: {
                    beginAtZero: true,
                }
            }
        }
    }
});

//---current level chart
// Get voltage level from firebase
firebase.database().ref('Variable/OutC').on('value', function (snapshot) {
    var data2 = snapshot.val();
    updatechart2(data2);
});

function updatechart2(data2) {
    serverTimeRef.on('value', function (snapshot) {
        var serverTime = snapshot.val();
        // Convert the server time to a Date object
        var epoch = Date.now(serverTime);
        var timestamp = new Date(epoch);
        timestamp = timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds();
        // Update your voltage level chart using the new server time

        // Update the chart data
        currentLevelChart.data.labels.push(timestamp);
        currentLevelChart.data.datasets[0].data.push(data2);

        // Limit the number of data points displayed on the chart
        const maxDataPoints = 10;
        if (currentLevelChart.data.labels.length > maxDataPoints) {
            currentLevelChart.data.labels.shift();
            currentLevelChart.data.datasets[0].data.shift();
        }
        // Redraw the chart
        currentLevelChart.update();
    });
}


// Create a chart using Chart.js
var ctx = document.getElementById('currentLevelChart').getContext('2d');
var currentLevelChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Output current',
            data: [],
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
        }]
    },
    options: {
        scales: {
            x: [{
                type: 'linear',
            }],
            y: {
                min: 0,
                max: 100,
                ticks: {
                    beginAtZero: true,
                }
            }
        }
    }
});

//--car icon
// Define car icon
var carIcon = L.icon({
    iconUrl: 'car-icon.png', // Path to the car icon image
    iconSize: [32, 32], // Size of the icon
    iconAnchor: [16, 16], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -32] // Point from which the popup should open relative to the iconAnchor
});

//---map
var map = L.map('mapid').setView([2.194, 102.248], 18);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var vehicleMarker = L.marker([2.194, 102.248], { icon: carIcon }).addTo(map);

// Assuming `vehiclePosition` is an array containing the current vehicle position [latitude, longitude]
// Listen for value changes in the Firebase Realtime Database
firebase.database().ref('Variable').on('value', function (snapshot) {
    var data = snapshot.val();
    var latitude = data.latitude;
    var longitude = data.longitude;

    // Update the marker location
    vehicleMarker.setLatLng([latitude, longitude]);

    // Pan the map to the updated marker location
    map.panTo([latitude, longitude]);
});



