export interface Major {
  major_id: number;
  major_code: string;
  major_name: string;
}
export interface Course {
  course_id: number;
  course_name: string;
  course_code: string;
  catalog_id: number;
  tag: string;
}

export interface Concentrations {
  concentration_id: number;
  major_id: number;
  concentration_name: string;
}
