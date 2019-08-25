import {
    AfterViewInit,
    Component,
    ContentChild,
    ContentChildren,
    Input,
    OnChanges,
    OnInit,
    QueryList,
    SimpleChanges,
} from '@angular/core';
import { PageViewPageComponent } from './page-view-page/page-view-page.component';

@Component({
    selector: 'app-page-view',
    templateUrl: './page-view.component.html',
    styleUrls: ['./page-view.component.scss'],
})
export class PageViewComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() index;
    @ContentChildren(PageViewPageComponent) children: QueryList<PageViewPageComponent>;

    constructor() {}

    ngOnInit() {}

    ngAfterViewInit() {
        this.refreshPageStates();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.index.previousValue !== changes.index.currentValue) this.refreshPageStates();
    }

    async refreshPageStates() {
        setTimeout(() => {
            if (!this.children) return;
            this.children.forEach((child, index) => {
                if (index < this.index) child.state = -1;
                else if (index > this.index) child.state = 1;
                else child.state = 0;
            });
        }, 0);
    }
}
