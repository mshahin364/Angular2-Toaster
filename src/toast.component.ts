import {Component, Input, ViewChild, ViewContainerRef, EventEmitter, ComponentFactoryResolver}
from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser'

import {Toast} from './toast';
import {BodyOutputType} from './bodyOutputType';

@Component({
    selector: '[toastComp]',
    template: `
        <i class="toaster-icon" [ngClass]="iconClass"></i>
        <div class="toast-content">
            <div [ngClass]="toast.toasterConfig.titleClass">{{toast.title}}</div>
            <div [ngClass]="toast.toasterConfig.messageClass" [ngSwitch]="toast.bodyOutputType">
                <div *ngSwitchCase="bodyOutputType.Component" #componentBody></div>
                <div *ngSwitchCase="bodyOutputType.TrustedHtml" [innerHTML]="toast.body"></div>
                <div *ngSwitchCase="bodyOutputType.Default">{{toast.body}}</div>
            </div>
        </div>
        <div class="toast-close-button" *ngIf="toast.showCloseButton" (click)="click($event, toast)"
            [innerHTML]="safeCloseHtml">
        </div>`,
    outputs: ['clickEvent']
})

export class ToastComponent {
    
    @Input() toast: Toast;
    @Input() iconClass: string;
    @ViewChild('componentBody', { read: ViewContainerRef }) componentBody: ViewContainerRef;

    safeCloseHtml: SafeHtml;

    private bodyOutputType = BodyOutputType;
    public clickEvent = new EventEmitter();

    constructor(
      private sanitizer: DomSanitizer,
      private componentFactoryResolver : ComponentFactoryResolver
    ) {}

    ngOnInit() {
        if (this.toast.closeHtml) {
            this.safeCloseHtml = this.sanitizer.bypassSecurityTrustHtml(this.toast.closeHtml);
        }
    }

    ngAfterViewInit() {
        if (this.toast.bodyOutputType === this.bodyOutputType.Component) {
            let component = this.componentFactoryResolver.resolveComponentFactory(this.toast.body);
            this.componentBody.createComponent(component, null, this.componentBody.injector);            
        }
    }

    click(event, toast: Toast) {
        event.stopPropagation();
        this.clickEvent.emit({
            value : { toast: toast, isCloseButton: true}
        });
    }
}
