const axios = require('axios');
const API_KEYS = require('../../config/API_KEYS');

let gotPoem;
let gotNasaPic;
let lastFetchDate;
const A_DAY = 1000*60*60*24; // a day in milliseconds

async function getEntertainmentPage(req, res) {
    if(!gotPoem || gotPoem.status==='error' || olderThanADay()) {
        lastFetchDate = new Date();
        gotPoem = await getPoemOfTheDay();
    }
    if(!gotNasaPic || gotNasaPic.status==='error' || olderThanADay()) {
        gotNasaPic = await getNasaPicOfTheDay();
    }

    return res.render('entertainment/entertainmentPage',{gotPoem,gotNasaPic});
    //return res.render('entertainment/entertainmentPage');
}

module.exports = {
    getEntertainmentPage,
};

function olderThanADay(){
    if(!lastFetchDate) return true;
    if(new Date() - lastFetchDate >= A_DAY) return true;
    return false;
}

async function getPoemOfTheDay() {
    try {
        console.log('trying to fetch');
        const response = await axios.get('http://api.poems.one/pod');
        return {
            status:'ok',
            message:'Poem successfully fetched',
            poem: response.data.contents.poems[0].poem.poem,
            author: response.data.contents.poems[0].poem.author,
            title: response.data.contents.poems[0].poem.title,
            date: response.data.contents.poems[0].date,
        };
    } catch (error) {
        console.log('caught error');
        console.error(error);
        return {
            status: 'error',
            message:'Error occurred while fetching poem.'
        };
    }
}

async function getNasaPicOfTheDay() {
    try {
        const response = await axios.get(
            'https://api.nasa.gov/planetary/apod?api_key='+API_KEYS.NASA_API_KEY
        );
        return {
            status:'ok',
            message:'NASA pic successfully fetched',
            mediaType: response.data.media_type,
            title: response.data.title,
            description: response.data.explanation,
            imgUrl: response.data.url,
        };
    } catch (error) {
        console.error(error);
        return {
            status: 'error',
            message:'Error occurred while fetching Nasa Pic.'
        };
    }
}