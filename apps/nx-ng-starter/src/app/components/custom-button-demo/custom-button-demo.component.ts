import {
  Component,
  OnInit
} from '@angular/core';

@Component({
  selector: 'custom-button-demo',
  templateUrl: './custom-button-demo.component.html',
  styleUrls: ['./custom-button-demo.component.css']
})
export class CustomButtonDemoComponent implements OnInit {

  constructor() { }

  public input: string = 'custom-button works!';

  ngOnInit() {
  }

}
