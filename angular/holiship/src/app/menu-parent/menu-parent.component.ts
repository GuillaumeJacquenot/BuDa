import {Component, OnInit, NgZone, Output, Input, EventEmitter} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {trigger, state, style, transition, animate, keyframes} from '@angular/animations';

@Component({
  selector: 'app-menu-parent',
  templateUrl: './menu-parent.component.html',
  styleUrls: ['./menu-parent.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(250px, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
    trigger('wobble', [
      transition('inactive => active', animate(1000, keyframes([
        style({opacity: '0.5'}),
        style({opacity: '0'}),
        style({opacity: '0.5'}),
        style({opacity: '1'}),
        style({opacity: '0.5'}),
        style({opacity: '0'}),
        style({opacity: '0.5'}),
        style({opacity: '1'}),
      ]))),
    ])
  ]
})
export class MenuParentComponent implements OnInit {
  @Output('backEvent') backEvent: EventEmitter<any> = new EventEmitter();

  @Input('title') ComponentTitle: string;
  @Input('routes') routes: any[] = [];

  userName: string;

  constructor(public zone: NgZone,
              public router: Router,
              private route: ActivatedRoute) {
    this.userName = localStorage.getItem('user') || 'Please login';
  }

  menuState = 'out';
  public wobbleState = 'inactive';

  toggleMenu() {
    this.menuState = this.menuState === 'out' ? 'in' : 'out';
  }

  backBtnClick() {
    console.log('Going back');
    this.backEvent.emit();
  }

  goToUsers() {
    this.router.navigate([`users`]);
  }

  navigateTo(route) {
    this.router.navigate([route]);
  }

  logOut() {
    localStorage.removeItem('user');
    window.location.replace('/login');
  }

  public triggerAnimation() {
    console.log(this.wobbleState);
    // this.wobbleState = 'inactive';
    this.wobbleState = 'active';
    console.log(this.wobbleState);
    setTimeout(() => this.reset(), 1000);
  }

  reset() {
    this.zone.run(() => {
      this.wobbleState = 'inactive';
    });
  }

  ngOnInit() {
    // console.log(this.routes);
  }

}
