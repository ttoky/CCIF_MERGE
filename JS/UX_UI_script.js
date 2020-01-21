var testArray = [{
        name: "Species One",
        maxDecRate: 40,
        relatedSpecies: [{
                name: "Species Ten"
            },
            {
                name: "Species Eleven"
            },
            {
                name: "Species Twelve"
            },
            {
                name: "Species Thirteen"
            },
            {
                name: "Species Fourteen"
            }
        ]
    },
    {
        name: "Species Two",
        maxDecRate: 100,
        relatedSpecies: [{
                name: "Species Twenty"
            },
            {
                name: "Species Twenty One"
            },
            {
                name: "Species Twenty Two"
            },
            {
                name: "Species Twenty Three"
            }
        ]
    },
    {
        name: "Species Three",
        maxDecRate: 70,
        relatedSpecies: [{
                name: "Species Thirty"
            },
            {
                name: "Species Thirty One"
            },
            {
                name: "Species Thirty Two"
            },
            {
                name: "Species Thirty Three"
            },
            {
                name: "Species Thirty Four"
            },
            {
                name: "Species Thirty Five"
            }
        ]
    }
]


//----- move to COMMON_script.js 
var degreeChange=0;
var decreaseRate=0;


// Vertical scroll height. It is changealbe and currently set as 20000px.
var verticalHeight = 20000;

// Selected Species and max decrease rate will be assigned based on user input(click)
var selectedArray = testArray[0]
var selectedSpecies = selectedArray.name
var selectedSpeciesMaxDecreaseRate = selectedArray.maxDecRate
var relatedSpeciesArray = selectedArray.relatedSpecies


function displayRelatedSpecies(objectArray) {
    var mapObject = objectArray.map(function (species) {
        return `<li><a href="#">${species.name}</a></li>`
    })
    return mapObject.join('')
}

var relatedSpeciesHTML = displayRelatedSpecies(relatedSpeciesArray)



// Scroll Interaction
window.addEventListener("scroll", function (e) {
    degreeChange = (window.pageYOffset / (verticalHeight - this.window.innerHeight)) * 2;

    document.getElementById("degree-change").innerHTML = degreeChange.toFixed(1);
    // Set for debugging. Will be deleted after testing. 
    document.getElementById("pixel-change").innerHTML = this.window.pageYOffset + "px";

    decreaseRate = (window.pageYOffset / (verticalHeight - this.window.innerHeight)) * selectedSpeciesMaxDecreaseRate;
   
    this.document.getElementById("selected-species").innerHTML = selectedSpecies;
    this.document.getElementById("decrease-rate").innerHTML = decreaseRate.toFixed(0) + "%";
});

// Nav Button Interaction 
document.addEventListener('click', function (e) {
    if (e.target.id === "target-one") {
        selectedArray = testArray[0]
    }

    if (e.target.id === "target-two") {
        selectedArray = testArray[1]
    }

    if (e.target.id === "target-three") {
        selectedArray = testArray[2]
    }

    selectedSpecies = selectedArray.name;
    selectedSpeciesMaxDecreaseRate = selectedArray.maxDecRate;

    decreaseRate = (window.pageYOffset / (verticalHeight - window.innerHeight)) * selectedSpeciesMaxDecreaseRate;
    document.getElementById("selected-species").innerHTML = selectedSpecies;
    document.getElementById("decrease-rate").innerHTML = decreaseRate.toFixed(0) + "%";

    relatedSpeciesArray = selectedArray.relatedSpecies
    relatedSpeciesHTML = displayRelatedSpecies(relatedSpeciesArray)
    document.getElementById("related-species-list").innerHTML = `${relatedSpeciesHTML}`
})
