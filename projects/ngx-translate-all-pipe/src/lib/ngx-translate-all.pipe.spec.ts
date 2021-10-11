import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injectable, ViewContainerRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { TranslateAllPipe } from './ngx-translate-all.pipe';
import {
  DefaultLangChangeEvent,
  LangChangeEvent,
  TranslateLoader,
  TranslateModule,
  TranslateService
} from '@ngx-translate/core';

class FakeChangeDetectorRef extends ChangeDetectorRef {
  markForCheck(): void {
  }

  detach(): void {
  }

  detectChanges(): void {
  }

  checkNoChanges(): void {
  }

  reattach(): void {
  }
}

@Injectable()
@Component({
  selector: 'lib-hmx-app',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{['TEST'] | translateAll}}`
})
class AppComponent {
  viewContainerRef: ViewContainerRef;

  constructor(viewContainerRef: ViewContainerRef) {
    this.viewContainerRef = viewContainerRef;
  }
}

let translations: any = {TEST: 'This is a test'};

class FakeLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    return of(translations);
  }
}

describe('TranslateAllPipe', () => {
  let translate: TranslateService;
  let translateAllPipe: TranslateAllPipe;
  let ref: any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: FakeLoader}
        })
      ],
      declarations: [AppComponent, TranslateAllPipe]
    });
    translate = TestBed.inject(TranslateService);
    ref = new FakeChangeDetectorRef();
    translateAllPipe = new TranslateAllPipe(translate, ref);
  });

  afterEach(() => {
    translate = undefined;
    translations = {TEST: 'This is a test'};
    translateAllPipe = undefined;
    ref = undefined;
  });

  it('is defined', () => {
    expect(TranslateAllPipe).toBeDefined();
    expect(translateAllPipe).toBeDefined();
    expect(translateAllPipe instanceof TranslateAllPipe).toBeTruthy();
  });

  it('should translate a string', () => {
    translate.setTranslation('en', {TEST: 'This is a test'});
    translate.use('en');

    expect(translateAllPipe.transform(['TEST'])).toEqual(['This is a test']);
  });

  it('should call markForChanges when it translates a string', () => {
    translate.setTranslation('en', {TEST: 'This is a test'});
    translate.use('en');
    spyOn(ref, 'markForCheck').and.callThrough();

    translateAllPipe.transform(['TEST']);
    expect(ref.markForCheck).toHaveBeenCalled();
  });

  it('should translate a string with object parameters', () => {
    translate.setTranslation('en', {TEST: 'This is a test {{param}}'});
    translate.use('en');

    expect(translateAllPipe.transform(['TEST'], {param: 'with param'})).toEqual(['This is a test with param']);
  });

  it('should translate a string with object as string parameters', () => {
    translate.setTranslation('en', {TEST: 'This is a test {{param}}'});
    translate.use('en');

    expect(translateAllPipe.transform(['TEST'], '{param: "with param"}')).toEqual(['This is a test with param']);
    expect(translateAllPipe.transform(['TEST'], '{"param": "with param"}')).toEqual(['This is a test with param']);
    expect(translateAllPipe.transform(['TEST'], '{param: \'with param\'}')).toEqual(['This is a test with param']);
    expect(translateAllPipe.transform(['TEST'], '{\'param\' : \'with param\'}')).toEqual(['This is a test with param']);
  });

  it('should translate a string with object as multiple string parameters', () => {
    translate.setTranslation('en', {TEST: 'This is a test {{param1}} {{param2}}'});
    translate.use('en');

    expect(translateAllPipe.transform(['TEST'], '{param1: "with param-1", param2: "and param-2"}'))
        .toEqual(['This is a test with param-1 and param-2']);
    expect(translateAllPipe.transform(['TEST'], '{"param1": "with param-1", "param2": "and param-2"}'))
        .toEqual(['This is a test with param-1 and param-2']);
    expect(translateAllPipe.transform(['TEST'], '{param1: \'with param-1\', param2: \'and param-2\'}'))
        .toEqual(['This is a test with param-1 and param-2']);
    expect(translateAllPipe.transform(['TEST'], '{\'param1\' : \'with param-1\', \'param2\': \'and param-2\'}'))
        .toEqual(['This is a test with param-1 and param-2']);
  });

  it('should translate a string with object as nested string parameters', () => {
    translate.setTranslation('en', {TEST: 'This is a test {{param.one}} {{param.two}}'});
    translate.use('en');

    expect(translateAllPipe.transform(['TEST'], '{param: {one: "with param-1", two: "and param-2"}}'))
        .toEqual(['This is a test with param-1 and param-2']);
    expect(translateAllPipe.transform(['TEST'], '{"param": {"one": "with param-1", "two": "and param-2"}}'))
        .toEqual(['This is a test with param-1 and param-2']);
    expect(translateAllPipe.transform(['TEST'], '{param: {one: \'with param-1\', two: \'and param-2\'}}'))
        .toEqual(['This is a test with param-1 and param-2']);
    expect(translateAllPipe.transform(['TEST'], '{\'param\' : {\'one\': \'with param-1\', \'two\': \'and param-2\'}}'))
        .toEqual(['This is a test with param-1 and param-2']);
  });

  it('should update the value when the parameters change', () => {
    translate.setTranslation('en', {TEST: 'This is a test {{param}}'});
    translate.use('en');

    spyOn(translateAllPipe, 'updateValue').and.callThrough();
    spyOn(ref, 'markForCheck').and.callThrough();

    expect(translateAllPipe.transform(['TEST'], {param: 'with param'})).toEqual(['This is a test with param']);
    // same value, shouldn't call 'updateValue' again
    expect(translateAllPipe.transform(['TEST'], {param: 'with param'})).toEqual(['This is a test with param']);
    // different param, should call 'updateValue'
    expect(translateAllPipe.transform(['TEST'], {param: 'with param2'})).toEqual(['This is a test with param2']);
    expect(translateAllPipe.updateValue).toHaveBeenCalledTimes(2);
    expect(ref.markForCheck).toHaveBeenCalledTimes(2);
  });

  it('should throw if you don\'t give an object parameter', () => {
    translate.setTranslation('en', {TEST: 'This is a test {{param}}'});
    translate.use('en');
    const param = 'param: "with param"';

    expect(() => {
      translateAllPipe.transform(['TEST'], param);
    }).toThrowError(`Wrong parameter in TranslateAllPipe. Expected a valid Object, received: ${param}`);
  });

  it('should return given falsey or non length query', () => {
    translate.setTranslation('en', {TEST: 'This is a test'});
    translate.use('en');

    expect(translateAllPipe.transform(null)).toBeNull();
    expect(translateAllPipe.transform(undefined)).toBeUndefined();
    expect(translateAllPipe.transform(1234 as any)).toBe(1234 as any);
  });

  describe('should update translations on lang change', () => {
    it('with fake loader', (done) => {
      translate.setTranslation('en', {TEST: 'This is a test'});
      translate.setTranslation('fr', {TEST: 'C\'est un test'});
      translate.use('en');

      expect(translateAllPipe.transform(['TEST'])).toEqual(['This is a test']);

      // this will be resolved at the next lang change
      const subscription = translate.onLangChange.subscribe((res: LangChangeEvent) => {
        expect(res.lang).toEqual('fr');
        expect(translateAllPipe.transform(['TEST'])).toEqual(['C\'est un test']);
        subscription.unsubscribe();
        done();
      });

      translate.use('fr');
    });

    it('with file loader', (done) => {
      translate.use('en');
      expect(translateAllPipe.transform(['TEST'])).toEqual(['This is a test']);

      // this will be resolved at the next lang change
      const subscription = translate.onLangChange.subscribe((res: LangChangeEvent) => {
        // let it update the translations
        setTimeout(() => {
          expect(res.lang).toEqual('fr');
          expect(translateAllPipe.transform(['TEST'])).toEqual(['C\'est un test']);
          subscription.unsubscribe();
          done();
        });
      });

      translations = {TEST: 'C\'est un test'};
      translate.use('fr');
    });

    it('should detect changes with OnPush', () => {
      const fixture = (TestBed as any).createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toEqual('TEST');
      translate.use('en');
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toEqual('This is a test');
    });
  });

  describe('should update translations on default lang change', () => {
    it('with fake loader', (done) => {
      translate.setTranslation('en', {TEST: 'This is a test'});
      translate.setTranslation('fr', {TEST: 'C\'est un test'});
      translate.setDefaultLang('en');

      expect(translateAllPipe.transform(['TEST'])).toEqual(['This is a test']);

      // this will be resolved at the next lang change
      const subscription = translate.onDefaultLangChange.subscribe((res: DefaultLangChangeEvent) => {
        expect(res.lang).toEqual('fr');
        expect(translateAllPipe.transform(['TEST'])).toEqual(['C\'est un test']);
        subscription.unsubscribe();
        done();
      });

      translate.setDefaultLang('fr');
    });

    it('with file loader', (done) => {
      translate.setDefaultLang('en');
      expect(translateAllPipe.transform(['TEST'])).toEqual(['This is a test']);

      // this will be resolved at the next lang change
      const subscription = translate.onDefaultLangChange.subscribe((res: DefaultLangChangeEvent) => {
        // let it update the translations
        setTimeout(() => {
          expect(res.lang).toEqual('fr');
          expect(translateAllPipe.transform(['TEST'])).toEqual(['C\'est un test']);
          subscription.unsubscribe();
          done();
        });
      });

      translations = {TEST: 'C\'est un test'};
      translate.setDefaultLang('fr');
    });

    it('should detect changes with OnPush', () => {
      const fixture = (TestBed as any).createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toEqual('TEST');
      translate.setDefaultLang('en');
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toEqual('This is a test');
    });
  });
});
