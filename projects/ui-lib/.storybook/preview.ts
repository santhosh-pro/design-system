import { Preview } from '@storybook/angular';
import { provideHttpClient } from '@angular/common/http';
import { applicationConfig } from '@storybook/angular';
import { provideNgxMask } from '../src/lib/components/input-mask/ngx-mask.providers';
import { provideAngularSvgIcon } from '../src/lib/components/app-svg-icon/lib/angular-svg-icon.module';

const preview: Preview = {
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