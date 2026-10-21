import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { RouteFilters, Courses, CoursesPayload } from '../models/courses.model';
interface ApiResponse<T> { success?: boolean; data: T; }
function isEvent(data: unknown): data is Courses { return typeof data === 'object' && data !== null && '_id' in data; }
function extractData<T>(response: ApiResponse<T> | null | undefined, valid: (data:T)=>boolean): T {
 const data=response?.data; if(data===undefined || data===null || !valid(data)) throw new Error('INVALID_RESPONSE'); return data;
}
@Injectable({providedIn:'root'})
export class CoursesService {
 private readonly api=inject(ApiService);
 list(filters: RouteFilters = {}): Observable<Courses[]> {
  let params=new HttpParams(); if(filters.includeDeleted) params=params.set('includeDeleted','true');
  return this.api.get<ApiResponse<Courses[]>>('events',params).pipe(map(r=>extractData(r,Array.isArray)));
 }
 getById(id: string): Observable<Courses> {  return this.api.get<ApiResponse<Courses>>(`events/${encodeURIComponent(id)}`).pipe(map(r => extractData(r, isEvent)));}
getBySlug(slug: string): Observable<Courses> {  return this.api.get<ApiResponse<Courses>>(`events/slug/${encodeURIComponent(slug)}`).pipe(map(r => extractData(r, isEvent)));}
create(payload: CoursesPayload): Observable<Courses> {  return this.api.post<ApiResponse<Courses>>('events', payload).pipe(map(r => extractData(r, isEvent)));}
update(id: string, payload: Partial<CoursesPayload>): Observable<Courses> {  return this.api.patch<ApiResponse<Courses>>(`events/${encodeURIComponent(id)}`, payload).pipe(map(r => extractData(r, isEvent)));}
remove(id: string): Observable<Courses> {  return this.api.delete<ApiResponse<Courses>>(`events/${encodeURIComponent(id)}`).pipe(map(r => extractData(r, isEvent)));}
setStatus(id: string, status: 'active' | 'inactive'): Observable<Courses> {  const action = status === 'active' ? 'activate' : 'deactivate';  return this.api.patch<ApiResponse<Courses>>(`events/${encodeURIComponent(id)}/${action}`).pipe(map(r => extractData(r, isEvent)));}
restore(_id: string): Observable<Courses> {throw new Error('El backend no dispone de una ruta para restaurar eventos eliminados.');}
}
