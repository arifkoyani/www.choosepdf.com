import { useState, useCallback } from 'react';
import type { Annotation, TextFieldAnnotation, CheckboxAnnotation, ImageAnnotation } from '@/app/types/annotations';

export function useAnnotations() {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const addAnnotation = useCallback((annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation]);
    setSelectedId(annotation.id);
  }, []);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev =>
      prev.map(ann => {
        if (ann.id !== id) return ann;
        return { ...ann, ...updates } as Annotation;
      })
    );
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  const clearAllAnnotations = useCallback(() => {
    setAnnotations([]);
    setSelectedId(null);
  }, []);

  const selectAnnotation = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const getSelectedAnnotation = useCallback(() => {
    return annotations.find(ann => ann.id === selectedId) || null;
  }, [annotations, selectedId]);

  const createTextField = useCallback((x: number, y: number, page: number): TextFieldAnnotation => {
    return {
      id: `textfield-${Date.now()}`,
      type: 'TextField',
      x,
      y,
      width: 150,
      height: 30,
      page,
      text: 'Text here',
      fontSize: 14,
      fontFamily: 'Arial',
      fontBold: false,
      fontItalic: false,
      fontStrikeout: false,
      fontUnderline: false,
      color: '#000000',
      alignment: 'left',
      transparent: true,
    };
  }, []);

  const createCheckbox = useCallback((x: number, y: number, page: number, checked: boolean = false): CheckboxAnnotation => {
    return {
      id: `checkbox-${Date.now()}`,
      type: checked ? 'CheckedCheckbox' : 'Checkbox',
      x,
      y,
      width: 20,
      height: 20,
      page,
    };
  }, []);

  const createImageAnnotation = useCallback((x: number, y: number, page: number, url: string): ImageAnnotation => {
    return {
      id: `image-${Date.now()}`,
      type: 'Image',
      x,
      y,
      width: 100,
      height: 100,
      page,
      url,
    };
  }, []);

  return {
    annotations,
    selectedId,
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    clearAllAnnotations,
    selectAnnotation,
    getSelectedAnnotation,
    createTextField,
    createCheckbox,
    createImageAnnotation,
  };
}
