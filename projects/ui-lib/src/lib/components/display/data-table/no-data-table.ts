import { Component, input } from '@angular/core';
import { NoDataComponent } from "../../feedback/no-data/no-data";

@Component({
  selector: 'ui-no-data-table',
  standalone: true,
  imports: [
    NoDataComponent
  ],
  template: `
          <tbody class="bg-white text-center py-14">
            <tr>
              <td colspan="10">
                <div class="py-14">
                  <ui-no-data class="" [message]="message() ?? 'No data found'"></ui-no-data>
                </div>
              </td>
            </tr>
        </tbody>
`,
})
export class NoDataTableComponent {
  message = input<string>();
}
