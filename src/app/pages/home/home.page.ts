import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Device } from '../../states/devices/device';
import { DevicesState } from '../../states/devices/devices.state';
import { PositionAccuracy } from '../../states/measures/measure';
import { StartMeasure, StartWatchPosition, StopWatchPosition } from '../../states/measures/measures.action';
import { MeasuresState } from '../../states/measures/measures.state';
import { AutoUnsubscribePage } from '../auto-unsubscribe.page';

@Component({
  selector: 'app-page-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage extends AutoUnsubscribePage {
  @Select(DevicesState.connectedDevice) connectedDevice$: Observable<Device>;
  @Select(MeasuresState.positionAccuracy) positionAccuracy$: Observable<PositionAccuracy>;

  positionAccuracy = PositionAccuracy;

  constructor(private router: Router, private store: Store, private actions$: Actions) {
    super();
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd && event.url !== '/#'))
      .subscribe(event => {
        if (event.urlAfterRedirects === '/tabs/(home:home)') {
          this.store.dispatch(new StartWatchPosition());
          this.subscriptions.push(
            this.actions$.pipe(ofActionSuccessful(StartMeasure)).subscribe(() => this.router.navigate(['measure']))
          );
        } else {
          this.store.dispatch(new StopWatchPosition());
          this.ionViewWillLeave();
        }
      });
  }

  goToDevices() {
    this.router.navigate([
      'tabs',
      {
        outlets: {
          settings: 'devices',
          home: null
        }
      }
    ]);
  }

  startMeasure() {
    this.connectedDevice$
      .pipe(take(1))
      .subscribe(connectedDevice => this.store.dispatch(new StartMeasure(connectedDevice)));
  }
}