export type AnnotationType = 'TextField' | 'Checkbox' | 'CheckedCheckbox' | 'Image';

export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface TextFieldAnnotation extends BaseAnnotation {
  type: 'TextField';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
}

export interface CheckboxAnnotation extends BaseAnnotation {
  type: 'Checkbox' | 'CheckedCheckbox';
}

export interface ImageAnnotation extends BaseAnnotation {
  type: 'Image';
  url: string;
}

export type Annotation = TextFieldAnnotation | CheckboxAnnotation | ImageAnnotation;

export interface PDFPayload {
  url: string;
  inline: boolean;
  annotations: {
    text?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    pages: string;
    type: string;
    id: string;
  }[];
  images: {
    url: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    pages: string;
  }[];
}
