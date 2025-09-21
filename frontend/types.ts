
export interface Color {
  name: string;
  hex: string;
  description: string;
}

export interface TypographyStyle {
  fontFamily: string;
  fontWeight: string;
  description: string;
}

export interface Typography {
  heading: TypographyStyle;
  body: TypographyStyle;
  code: TypographyStyle;
}

export interface DesignGuide {
  projectName: string;
  palette: Color[];
  typography: Typography;
  iconography: string;
  layout: string;
  logoConcept: string;
}
