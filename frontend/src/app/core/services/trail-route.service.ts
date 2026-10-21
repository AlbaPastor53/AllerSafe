import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service';
import { RouteFilters, TrailRoute, TrailRoutePayload } from '../models/trail-route.model';
interface ApiResponse<T> { success?: boolean; data: T; }
function isEvent(data: unknown): data is TrailRoute { return typeof data === 'object' && data !== null && '_id' in data; }
function extractData<T>(response: ApiResponse<T> | null | undefined, valid: (data:T)=>boolean): T {
 const data=response?.data; if(data===undefined || data===null || !valid(data)) throw new Error('INVALID_RESPONSE'); return data;
}
@Injectable({providedIn:'root'})
export class TrailRouteService {
 private readonly api=inject(ApiService);
 list(filters: RouteFilters = {}): Observable<TrailRoute[]> {
  let params=new HttpParams(); if(filters.includeDeleted) params=params.set('includeDeleted','true');
  return this.api.get<ApiResponse<TrailRoute[]>>('events',params).pipe(map(r=>extractData(r,Array.isArray)));
 }
 getById(id:string):Observable<TrailRoute>{return this.api.get<ApiResponse<TrailRoute>>(`events/${encodeURIComponent(id)}`).pipe(map(r=>extractData(r,isEvent)));}
 getBySlug(slug:string):Observable<TrailRoute>{return this.api.get<ApiResponse<TrailRoute>>(`events/slug/${encodeURIComponent(slug)}`).pipe(map(r=>extractData(r,isEvent)));}
 create(payload:TrailRoutePayload):Observable<TrailRoute>{return this.api.post<ApiResponse<TrailRoute>>('events',payload).pipe(map(r=>extractData(r,isEvent)));}
 update(id:string,payload:Partial<TrailRoutePayload>):Observable<TrailRoute>{return this.api.patch<ApiResponse<TrailRoute>>(`events/${encodeURIComponent(id)}`,payload).pipe(map(r=>extractData(r,isEvent)));}
 remove(id:string):Observable<TrailRoute>{return this.api.delete<ApiResponse<TrailRoute>>(`events/${encodeURIComponent(id)}`).pipe(map(r=>extractData(r,isEvent)));}
 setStatus(id:string,status:'active'|'inactive'):Observable<TrailRoute>{const action=status==='active'?'activate':'deactivate';return this.api.patch<ApiResponse<TrailRoute>>(`events/${encodeURIComponent(id)}/${action}`).pipe(map(r=>extractData(r,isEvent)));}
 restore(_id:string):Observable<TrailRoute>{throw new Error('El backend no dispone de una ruta para restaurar eventos eliminados.');}
}
