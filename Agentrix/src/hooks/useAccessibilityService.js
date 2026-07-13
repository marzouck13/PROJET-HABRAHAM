// src/hooks/useAccessibilityService.js
import { useState, useEffect, useCallback } from 'react';
import { NativeModules, AppState } from 'react-native';

const MomoAutomationModule = NativeModules.MomoAutomationModule;

export function useAccessibilityService() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fabricant, setFabricant] = useState('');

  const checkService = useCallback(async () => {
    if (!MomoAutomationModule || !MomoAutomationModule.isAccessibilityServiceEnabled) {
      setIsLoading(false);
      return false;
    }

    try {
      const enabled = await MomoAutomationModule.isAccessibilityServiceEnabled();
      setIsEnabled(enabled === true);
      setIsLoading(false);
      return enabled === true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  }, []);

  const detecterFabricant = useCallback(async () => {
    if (!MomoAutomationModule || !MomoAutomationModule.getDeviceManufacturer) {
      setFabricant('');
      return '';
    }
    try {
      const fab = await MomoAutomationModule.getDeviceManufacturer();
      const fabricantString = (typeof fab === 'string' && fab.length > 0) ? fab : '';
      setFabricant(fabricantString);
      return fabricantString;
    } catch (error) {
      setFabricant('');
      return '';
    }
  }, []);

  const openAccessibilitySettings = useCallback(async () => {
    if (!MomoAutomationModule || !MomoAutomationModule.openAccessibilitySettings) {
      return false;
    }
    try {
      await MomoAutomationModule.openAccessibilitySettings();
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  const openAppSettings = useCallback(async () => {
    if (!MomoAutomationModule || !MomoAutomationModule.openAppSettings) {
      return false;
    }
    try {
      await MomoAutomationModule.openAppSettings();
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  useEffect(() => {
    detecterFabricant();
    checkService();
  }, [checkService, detecterFabricant]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkService();
      }
    });
    return () => {
      if (subscription && subscription.remove) subscription.remove();
    };
  }, [checkService]);

  return {
    isEnabled,
    isLoading,
    fabricant,
    checkService,
    openAccessibilitySettings,
    openAppSettings,
  };
}