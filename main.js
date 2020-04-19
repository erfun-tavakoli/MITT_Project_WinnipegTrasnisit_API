const wrapperElement = document.querySelector('.wrapper');

const getStreetData = (street, type) => {
  const streetRequestUrl = `https://api.winnipegtransit.com/v3/streets.json?name=${street}&type=${type}&api-key=IpAlX9fKoiK1oMdnQwgw`;

  return fetch(streetRequestUrl)
  .then(res => res.json())
  .then((streetObj) => {
    const key = streetObj.streets[0].key;
    return key;
  });
};

const getStopsData = (key) => {
  return fetch(`https://api.winnipegtransit.com/v3/stops.json?street=${key}&api-key=IpAlX9fKoiK1oMdnQwgw`)
  .then(res => res.json())
  .then((stopsObj) => {
    const allStopsArr = [];

    stopsObj.stops.forEach(stop => {
      allStopsArr.push(stop.key);
    });

    return allStopsArr;
  });
};

const getBuses = (allStops) => {
  const allPromisesArr = [];

  allStops.forEach(stopKey => {
    const stopScheduleUrl = `https://api.winnipegtransit.com/v3/stops/${stopKey}/schedule.json?api-key=IpAlX9fKoiK1oMdnQwgw&max-results-per-route=2`;
    
    allPromisesArr.push(fetch(stopScheduleUrl));
  });

  return allPromisesArr;
};

const addHtml = (data) => {
  const html = `
    <div class='stop'>
      <h2> STOP NAME: ${data['stop-schedule'].stop.name} </h2>
      <h3> DIRECTION: ${data['stop-schedule'].stop.direction} </h3>
      <h3> CROSS-STREET: ${data['stop-schedule'].stop['cross-street'].name} </h3>
  `;
  let noBusesHtml = html + '<p> no buses availble </p> </div>';
  let busesHtml = html;

  if(data['stop-schedule']['route-schedules'].length === 0) {
    wrapperElement.insertAdjacentHTML('beforeend', noBusesHtml)
  } else {
    data['stop-schedule']['route-schedules'].forEach(route => {
      busesHtml += `
        <p> ${route.route.name} </p>
      `;
  
      route['scheduled-stops'].forEach(schedule => {
        busesHtml += `
          <p>UP COMMING BUS AT: ${schedule.times.arrival.scheduled} </p>
        `;
      });
    });
  
    wrapperElement.insertAdjacentHTML('beforeend', busesHtml + '</div>');
  };
  
  wrapperElement.insertAdjacentHTML('beforeend', `<hr/>`);
};

// the program
getStreetData('Henlow', 'Bay')
  .then(key => getStopsData(key))
  .then(allStopsArr => getBuses(allStopsArr))
  .then((promisesArr) => {
    Promise.all(promisesArr)
    .then(responsesArr => responsesArr.forEach((res) => {
      res.json().then(prom => addHtml(prom));
    }));
  });
