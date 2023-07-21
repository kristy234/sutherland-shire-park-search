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

function prePopulateFiltersFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    const selectedFacilitiesParam = urlParams.get('facility');
    const selectedFacilities = selectedFacilitiesParam ? selectedFacilitiesParam.split(",") : [];

    const selectedSuburbsParam = urlParams.get('suburb');
    const selectedSuburbs = selectedSuburbsParam ? selectedSuburbsParam.split(",") : [];

    const facilityFilter = document.getElementById(FILTER_FACILITY_ID);
    const suburbFilter = document.getElementById(FILTER_SUBURB_ID);

    selectedFacilities.forEach(facility => {
        selectOptionByText(facility, facilityFilter);
    });

    selectedSuburbs.forEach(suburb => {
        selectOptionByText(suburb, suburbFilter);
    });
}

function selectOptionByText(text, selectElement) {
    const options = Array.from(selectElement.options);

    const option = options.find(option => option.textContent.toLowerCase() === text.toLowerCase());
    if (option) {
        option.selected = true;
    }
}

function createParkItem(parkData) {
    const parkItemDiv = document.createElement('div');
    parkItemDiv.classList.add('park-item');

    // Park content (name, address, facilities)
    const parkContentDiv = document.createElement('div');
    parkContentDiv.classList.add('park-content');

    const parkNameHeading = document.createElement('h3');
    parkNameHeading.classList.add('park-name');
    parkNameHeading.textContent = parkData.park_name;
    parkContentDiv.appendChild(parkNameHeading);

    const parkAddressPara = document.createElement('p');
    parkAddressPara.classList.add('park-address');
    parkAddressPara.textContent = parkData.park_address;
    parkContentDiv.appendChild(parkAddressPara);

    const parkFacilitiesList = document.createElement('ul');
    parkFacilitiesList.classList.add('park-facilities');
    parkData.facilities.forEach(facility => {
    const facilityItem = document.createElement('li');
    facilityItem.textContent = facility;
    parkFacilitiesList.appendChild(facilityItem);
    });
    parkContentDiv.appendChild(parkFacilitiesList);

    parkItemDiv.appendChild(parkContentDiv);

    return parkItemDiv;
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
            const parkItem = createParkItem(park);
            parkList.appendChild(parkItem);
        });
    } else {
        const noResults = document.createElement('li');
        noResults.classList.add('no-results');
        noResults.textContent = 'No parks found matching the selected filters.';
        parkList.appendChild(noResults);
    }
}

function updateURLWithFilters() {
    const facilityFilter = document.getElementById(FILTER_FACILITY_ID);
    const suburbFilter = document.getElementById(FILTER_SUBURB_ID);

    const selectedFacilities = Array.from(facilityFilter.selectedOptions).map(option => option.textContent);
    const selectedSuburbs = Array.from(suburbFilter.selectedOptions).map(option => option.textContent);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('facility', selectedFacilities.join(','));
    searchParams.set('suburb', selectedSuburbs.join(','));

    const newURL = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({}, '', newURL);
}

function fetchData() {
    return fetch('parks.json')
        .then(response => response.json());
}

function onUpdate() {
    fetchData().then(data => {
        applyFilters(data);
        updateURLWithFilters();
    });
}

document.addEventListener("DOMContentLoaded", function() {
    $('.filter-select').select2();

    fetchData().then(data => {
        populateFilters(data);
        prePopulateFiltersFromURL();
        applyFilters(data);
    });

    const searchButton = document.getElementById('search-button');

    $('#' + FILTER_FACILITY_ID).on('change', onUpdate);
    $('#' + FILTER_SUBURB_ID).on('change', onUpdate);
    searchButton.addEventListener('click', onUpdate);
});
