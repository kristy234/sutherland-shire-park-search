const FILTER_FACILITY_ID = 'facility-filter';
const FILTER_SUBURB_ID = 'suburb-filter';
const PARK_LIST_ID = 'park-list';

function populateFilters(parksData) {
    const facilityFilter = document.getElementById(FILTER_FACILITY_ID);
    const suburbFilter = document.getElementById(FILTER_SUBURB_ID);

    const facilities = new Set();
    const suburbs = new Set();

    parksData.forEach(park => {
        park.facilities.forEach(facility => facilities.add(facility));
        suburbs.add(park.suburb);
    });

    const sortedFacilities = Array.from(facilities).sort();
    const sortedSuburbs = Array.from(suburbs).sort();

    facilityFilter.innerHTML = '';
    sortedFacilities.forEach(facility => {
        const option = document.createElement('option');
        option.textContent = facility;
        facilityFilter.appendChild(option);
    });

    suburbFilter.innerHTML = '';
    sortedSuburbs.forEach(suburb => {
        const option = document.createElement('option');
        option.textContent = suburb;
        suburbFilter.appendChild(option);
    });
}

function applyFilters(parksData) {
    const facilityFilter = document.getElementById(FILTER_FACILITY_ID);
    const suburbFilter = document.getElementById(FILTER_SUBURB_ID);
    const parkList = document.getElementById(PARK_LIST_ID);

    const selectedFacilities = Array.from(facilityFilter.selectedOptions).map(option => option.textContent);
    const selectedSuburbs = Array.from(suburbFilter.selectedOptions).map(option => option.textContent);

    const filteredParks = parksData.filter(park =>
        (selectedFacilities.length === 0 || selectedFacilities.every(facility => park.facilities.includes(facility))) &&
        (selectedSuburbs.length === 0 || selectedSuburbs.includes(park.suburb))
    );

    const sortedParks = filteredParks.sort((a, b) => {
        const suburbComparison = a.suburb.localeCompare(b.suburb);
        if (suburbComparison !== 0) {
            return suburbComparison;
        }
        return a.park_name.localeCompare(b.park_name);
    });

    parkList.innerHTML = '';

    if (sortedParks.length > 0) {
        sortedParks.forEach(park => {
            const listItem = document.createElement('li');
            listItem.classList.add('park-item');

            const parkName = document.createElement('a');
            parkName.classList.add('park-name');
            parkName.textContent = park.park_name + ' - ';
            parkName.href = park.canonical_link;
            listItem.appendChild(parkName);

            const parkSuburb = document.createElement('span');
            parkSuburb.classList.add('park-suburb');
            parkSuburb.textContent = park.suburb;
            parkName.appendChild(parkSuburb);

            const facilityList = document.createElement('ul');
            facilityList.classList.add('park-facilities');
            park.facilities.forEach(facility => {
                const facilityItem = document.createElement('li');
                facilityItem.textContent = facility;
                facilityList.appendChild(facilityItem);
            });
            listItem.appendChild(facilityList);

            parkList.appendChild(listItem);
        });
    } else {
        const noResults = document.createElement('li');
        noResults.classList.add('no-results');
        noResults.textContent = 'No parks found matching the selected filters.';
        parkList.appendChild(noResults);
    }
}

function fetchData() {
    return fetch('parks.json')
        .then(response => response.json())
        .catch(error => console.error(error));
}

function fetchAndApply() {
    fetchData().then(data => applyFilters(data));
}

document.addEventListener("DOMContentLoaded", function() {
    $('.filter-select').select2();

    fetchData().then(data => {
        populateFilters(data);
        applyFilters(data);
    });

    const searchButton = document.getElementById('search-button');

    $('#' + FILTER_FACILITY_ID).on('change', fetchAndApply);
    $('#' + FILTER_SUBURB_ID).on('change', fetchAndApply);
    searchButton.addEventListener('click', fetchAndApply);
});
