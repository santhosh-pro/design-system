import { Preview } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { applicationConfig } from '@storybook/angular';
import { provideNgxMask } from '../src/lib/components/forms/input-mask/ngx-mask.providers';
import { provideAngularSvgIcon } from '../src/lib/components/misc/app-svg-icon/lib/angular-svg-icon.module';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideHttpClient(),
        provideNgxMask(),
        provideAngularSvgIcon()
        // any other standalone providers like provideNgxMask()
      ],
    }),
  ],
};

export default preview;