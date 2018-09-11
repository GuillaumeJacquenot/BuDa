import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { NeoConnectService } from './neo-connect.service';

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private neoConn: NeoConnectService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard#canActivate called');
    const url: string = state.url;
    let isUser = false;

    this.neoConn.checkUserExistence(localStorage.getItem('user')).subscribe({
      onNext: res => {
        // console.log('next user in auth ', res);
        if (res.get('user.login')) {
          isUser = true;
          this.router.navigate([url]);
        }
      },
      onCompleted: res => {
        // console.log('user in auth ', res);
        if (!isUser) {
          this.router.navigate(['/login']);
        }
      },
      onError: err => {
        console.log('err in auth ', err);
      }
    });

    console.log(this.checkLogin(url));
    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (localStorage.getItem('user')) {
      let isUser = false;
      let timer = setInterval(() => {
        this.neoConn.checkUserExistence(localStorage.getItem('user')).subscribe({
          onNext: res => {
            isUser = false;
            // console.log('tnext user in auth ', res);
            if (res.get('user.login')) {
              isUser = true;
              // this.router.navigate([url]);
            }
          },
          onCompleted: res => {
            // console.log('tuser in auth ', res);
            if (!isUser) {
              this.router.navigate(['/login']);
              clearInterval(timer);
            }
          },
          onError: err => {
            console.log('terr in auth ', err);
          }
        });
      }, 6000)
      return true;
    }

    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }

}
