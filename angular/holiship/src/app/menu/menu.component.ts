import { Component, OnInit, Output, EventEmitter, IterableDiffers } from '@angular/core';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
  notifications: any = [];
  iterableDiffer: any;
  @Output('bell') bell: EventEmitter<any> = new EventEmitter;

  constructor(public notificationsService: NotificationsService, private _iterableDiffers: IterableDiffers) {
    this.iterableDiffer = this._iterableDiffers.find([]).create(null);
  }

  ngDoCheck() {
    const changes = this.iterableDiffer.diff(this.notifications);
    if (changes) {
      console.log('Changes detected!');
      this.bell.emit();
    }
  }

  ngOnInit() {
    this.notifications = this.notificationsService.getNotifications();
  }

}
