import { Component, OnInit, Input } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { TimeService } from '../services/time.service';
import { singleTimezone } from '../models/singleTimezone.model';
import { singleWeather } from '../models/singleWeather.model';
import { location } from '../models/location.model';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { StatsService } from '../services/stats.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css'],
  animations: [
    trigger('fadeTrigger', [
      state('show', style({
        opacity: 1,
      })
      ),
      state('hide', style({
        opacity: 0,
      })
      ),
      transition('show => hide', animate('10ms')),
      transition('hide => show', animate('1000ms')),
    ]),
  ],
})
export class WeatherComponent implements OnInit {

  // Will be accessible by children component
  public weatherData: singleWeather;
  public timeData: singleTimezone;
  public locationFreqData: location[];
  public errorMessage: string;
  public fadeState: boolean;

  constructor(
    private weatherService: WeatherService,
    private timeService: TimeService,
    private statsService: StatsService
  ) { }

  ngOnInit() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position: Position) => {
        console.log('got location: ', position.coords);
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        this.fetchLocationByCoords(coords);
      }, (error) => { // Location access denied 
        console.log(error);
        this.fetchLocationByName('GuelpH'); // Default location search
      }
      );
    }
  }

  fetchLocationByCoords(coords) {
    this.reset();
    const { lat, lng } = coords; // Event from click on map
    this.weatherService.fetchWeatherByCoords(lat, lng).subscribe((data) => {
      this.weatherData = data;
      this.fetchLocationTimes(data);
      this.fetchAllSearchedLocations();
    }, (error) => {
      console.log('err: ', error);
      this.errorMessage = error;
    });
  }

  fetchLocationByName(locationName: string) {
    this.reset();
    this.weatherService.fetchWeatherByName(locationName.toLowerCase()).subscribe((data) => {
      this.weatherData = data;
      this.fetchLocationTimes(data);
      this.fetchAllSearchedLocations();
    }, (error) => {
      console.log('err: ', error);
      this.errorMessage = error;
    });
  }

  fetchLocationTimes(weatherData: singleWeather) {
    this.timeService.getTimeOfLocation(weatherData.coord.lat, weatherData.coord.lon).subscribe((timeData) => {
      this.timeData = timeData;
      this.fadeState = true;
    }, (error) => {
      console.log('err: ', error);
      this.errorMessage = error;
    });
  }

  fetchAllSearchedLocations() {
    this.statsService.fetchAllSearched().subscribe((data) => {
      this.locationFreqData = data;
    }, (error) => {
      console.log('err: ', error);
      this.errorMessage = error;
    });
  }

  getFadeState = () => (this.fadeState ? 'show' : 'hide');
  reset = () => this.fadeState = this.errorMessage = this.timeData = this.weatherData = null;

}
