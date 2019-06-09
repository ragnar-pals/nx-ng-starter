import { TestBed, async } from '@angular/core/testing';

import { DateAdapter } from '@angular/material';

import { AppTranslateModuleWithProviders } from '../app-translate.module';

import { AppTranslationUtilsService } from './app-translate.service';
import { CustomMaterialModuleWithProviders } from 'libs/ui/common/custom-material/custom-material.module';

import {
  IUiDictionary,
  ISupportedLanguage,
  IUiLanguagesInterface,
  ILangCode
} from 'libs/data-access/interfaces/index';

import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

describe('AppTranslationUtilsService', () => {

  let service: AppTranslationUtilsService;
  let translate: TranslateService;
  let dateAdapter: DateAdapter<any>;
  let win: Window;
  let spy: any;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CustomMaterialModuleWithProviders,
        AppTranslateModuleWithProviders
      ],
      providers: [
        { provide: 'Window', useValue: window }
      ]
    }).compileComponents().then(() => {
      service = TestBed.get(AppTranslationUtilsService) as AppTranslationUtilsService;
      translate = TestBed.get(TranslateService) as TranslateService;
      dateAdapter = TestBed.get(DateAdapter) as DateAdapter<any>;
      win = TestBed.get('Window') as Window;

      spy = {
        service: {
          languageChanges: spyOn(service.languageChanges, 'next').and.callThrough()
        },
        translate: {
          onLangChange: spyOn(translate.onLangChange, 'subscribe').and.callThrough(),
          setDefaultLang: spyOn(translate, 'setDefaultLang').and.callThrough(),
          setTranslation: spyOn(translate, 'setTranslation').and.callThrough(),
          use: spyOn(translate, 'use').and.callThrough()
        },
        dateAdapter: {
          setLocale: spyOn(dateAdapter, 'setLocale').and.callThrough()
        }
      };
    });
  }));

  it('should exist and have variables and methods defined', () => {
    expect(service).toBeDefined();
    expect(service['languageChangeSubscription']).toEqual(jasmine.any(Function));
    expect(service.languageChanges).toEqual(jasmine.any(Subject));
    expect(service.initialize).toEqual(jasmine.any(Function));
    expect(service.getUserLanguagePreference).toEqual(jasmine.any(Function));
    expect(service['langs']).toEqual(jasmine.objectContaining({
      ru: 'ru',
      en: 'en'
    } as IUiLanguagesInterface));
    expect(service.languages).toEqual(jasmine.any(Function));
    expect(service['supportedLangs']).toEqual([
      { key: 'en', name: 'English' },
      { key: 'ru', name: 'Russian' }
    ] as ISupportedLanguage[]);
    expect(service.supportedLanguages).toEqual(jasmine.any(Function));
    expect(service['translations']).toEqual(jasmine.objectContaining({
      ru: jasmine.any(Object),
      en: jasmine.any(Object)
    } as IUiDictionary));
    expect(service.dictionaries).toEqual(jasmine.any(Function));
    expect(service.useLanguage).toEqual(jasmine.any(Function));
    expect(service.isCurrentLanguage).toEqual(jasmine.any(Function));
    expect(service['setDatepickersLocale']).toEqual(jasmine.any(Function));
  });

  it('languageChangeSubscription should work correctly', async(() => {
    service['languageChangeSubscription']();
    expect(translate.onLangChange.subscribe).toHaveBeenCalled();
    translate.onLangChange.subscribe(
      (langChangeEvent: any) => {
        expect(service.languageChanges.next).toHaveBeenCalledWith(langChangeEvent);
        expect(dateAdapter.setLocale).toHaveBeenCalledWith(langChangeEvent.lang);
      }
    );
  }));

  it('initialize should work correctly', () => {
    const callsBefore = {
      dateAdapter: {
        setLocale: spy.dateAdapter.setLocale.calls.count()
      },
      translate: {
        setDefaultLang: spy.translate.setDefaultLang.calls.count(),
        setTranslation: spy.translate.setTranslation.calls.count(),
        use: spy.translate.use.calls.count()
      }
    };
    service.initialize();
    const callsAfter = {
      dateAdapter: {
        setLocale: spy.dateAdapter.setLocale.calls.count()
      },
      translate: {
        setDefaultLang: spy.translate.setDefaultLang.calls.count(),
        setTranslation: spy.translate.setTranslation.calls.count(),
        use: spy.translate.use.calls.count()
      }
    };
    expect(dateAdapter.setLocale).toHaveBeenCalledWith('ru');
    expect(translate.setDefaultLang).toHaveBeenCalled();
    expect(translate.setTranslation).toHaveBeenCalled();
    expect(translate.use).toHaveBeenCalled();
    expect(callsAfter.dateAdapter.setLocale - callsBefore.dateAdapter.setLocale).toEqual(1);
    expect(callsAfter.translate.setDefaultLang - callsBefore.translate.setDefaultLang).toEqual(1);
    expect(callsAfter.translate.setTranslation - callsBefore.translate.setTranslation).toEqual(2);
    expect(callsAfter.translate.use - callsBefore.translate.use).toEqual(1);
  });

  it('getUserLanguagePreference should work correctly', () => {
    const navLang: string = win.navigator.language;
    const userPreference: ILangCode = (navLang.match(/(ru-RU|ru)/ig) || navLang[0].match(/(ru)/ig)) ? 'ru' : 'en';
    expect(service.getUserLanguagePreference()).toEqual(userPreference);
  });

  it('languages should return available UI language codes', () => {
    expect(service.languages()).toEqual(service['langs']);
  });

  it('supportedLanguages should return supported UI languages', () => {
    expect(service.supportedLanguages()).toEqual(service['supportedLangs']);
  });

  it('dictionaries should return UI dictionaries', () => {
    expect(service.dictionaries()).toEqual(service['translations']);
  });

  it('useLanguage should call translate.use if language is supported which is deternmined by language code', () => {
    const callsBefore = {
      translate: {
        use: spy.translate.use.calls.count()
      }
    };
    service.useLanguage(null);
    const callsAfter = {
      translate: {
        use: spy.translate.use.calls.count()
      }
    };
    expect(callsAfter.translate.use - callsBefore.translate.use).toEqual(0);

    service.useLanguage('ru');
    callsAfter.translate.use = spy.translate.use.calls.count();
    expect(callsAfter.translate.use - callsBefore.translate.use).toEqual(1);

    service.useLanguage('en');
    callsAfter.translate.use = spy.translate.use.calls.count();
    expect(callsAfter.translate.use - callsBefore.translate.use).toEqual(2);
  });

  it('isCurrentLanguage should resolve is language is current by its code', () => {
    const curLang: ILangCode = translate.currentLang as ILangCode;
    expect(service.isCurrentLanguage(null)).toBeFalsy();
    expect(service.isCurrentLanguage(curLang)).toBeTruthy();
  });

});
