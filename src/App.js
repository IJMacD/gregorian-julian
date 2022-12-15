import React, { useEffect } from 'react';
import { useState } from 'react';
import './App.css';
import { weekDayFromJD, formatDate, gregorianDateFromJD, julianDateFromJD, getRegionCalendar, politicalDateFromJD, jdFromISO8601 } from './date';

/**
 * 1582-10-15T00:00 = JD 2299160.5
 *
 * 1582-10-14T12:00 = JD 2299160.0
 * 1582-10-15T12:00 = JD 2299161.0
 */

const WEEKDAYS = [
  "",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const REGIONS = [
  "papal",
  "uk",
  "us_french",
  "uk",
  "russia",
  "france",
  "japan",
  "china",
]

const COMPLETE_JULIAN_RANGE = 365249;
const JULIAN_MIN = 2.1e6;

const INITIAL_LOAD_JULIAN = 2299160;

function App() {
  const [ jd, setJD ] = useState(INITIAL_LOAD_JULIAN);

  const length = 200;

  const range = Array.from({length}).map((_,i) => jd + i - length / 2);

  const height = 24;

  useEffect(() => {
    jumpTo(INITIAL_LOAD_JULIAN);
  }, []);

  useEffect(() => {
    const cb = (/** @type {Event} */ e) => {
      if (e.currentTarget instanceof Window) {
        setJD(JULIAN_MIN + Math.floor(e.currentTarget.scrollY / height));
      }
    };

    window.addEventListener("scroll", cb);

    return () => window.removeEventListener("scroll", cb);
  }, []);

  function jumpTo (jd) {
    setJD(jd);
    window.scrollTo(0, (jd - JULIAN_MIN) * height - window.innerHeight / 2);
  }

  function handleEnterJD () {
    const jd = +(prompt("Enter Julian Day Number (JDN)") || NaN);
    if (!isNaN(jd)){ jumpTo(jd); }
  }

  function handleEnterGregorian () {
    const iso = prompt("Enter Gregorian Date (ISO 8601)");
    if (!iso) return;
    const jd = jdFromISO8601(iso);
    if (!isNaN(jd)){ jumpTo(jd); }
  }

  return (
    <div className="App">
      <div className="table" style={{height:height*COMPLETE_JULIAN_RANGE,position:"relative"}}>
        <div className="thead row">
            <p onClick={handleEnterJD}>JD Number</p>
            <p>Week Day</p>
            <p onClick={handleEnterGregorian}>Gregorian<br/>(ISO 8601)</p>
            <p>Julian<br/>Calendar</p>
            <p>Papal<br/>States</p>
            <p>United<br/>Kingdom</p>
            <p>USA<br/>(French/Spanish)</p>
            <p>USA<br/>(British)</p>
            <p>Russia</p>
            <p>France</p>
            <p>Japan</p>
            <p>China</p>
        </div>
        <div style={{top:(jd-JULIAN_MIN-length/2)*height,position:"absolute"}}>
        {
          range.map(jd => (
            <div key={jd} style={{height}} className="row">
              <p className="jd"><span style={{top:height/2}}>{jd}</span></p>
              <p>{WEEKDAYS[weekDayFromJD(jd)]}</p>
              <p className="calendar-gregorian">{formatDate(gregorianDateFromJD(jd))}</p>
              <p className="calendar-julian">{formatDate(julianDateFromJD(jd))}</p>
              {
                REGIONS.map((region, i) => (
                  <p key={i} className={`calendar-${getRegionCalendar(region, jd)}`}>
                    {formatDate(politicalDateFromJD(region, jd))}
                  </p>
                ))
              }
            </div>
          ))
        }
        </div>
      </div>
    </div>
  );
}

export default App;
