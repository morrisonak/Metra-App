// ~/lib/schema.ts
import { pgTable, serial, varchar, text, date, timestamp, integer, numeric, primaryKey } from "drizzle-orm/pg-core";

export const inspections = pgTable('inspections', {
  id: serial('id').primaryKey(),
  crossing_id: text('crossing_id').references(() => railroadCrossings.crossing_id),
  inspection_date: date('inspection_date').notNull(),
  staff_type: text('staff_type').notNull(), // 'management' or 'represented'
  inspector_name: text('inspector_name').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});


export const railroadCrossings = pgTable('railroad_crossings', {
  // Primary key
  crossing_id: text('crossing_id').primaryKey(),
  
  // Basic information
  revision_date: timestamp('revision_date'),
  railroad_code: text('railroad_code'),
  railroad_name: text('railroad_name'),
  reporting_agency_type_code: text('reporting_agency_type_code'),
  reporting_agency_type: text('reporting_agency_type'),
  reason_code: text('reason_code'),
  reason_description: text('reason_description'),
  crossing_id_suffix: text('crossing_id_suffix'),
  
  // Reporting agency information
  reporting_agency_code: text('reporting_agency_code'),
  reporting_agency_name: text('reporting_agency_name'),
  
  // Location information
  state_code: text('state_code'),
  state_name: text('state_name'),
  county_code: text('county_code'),
  county_name: text('county_name'),
  in_near_code: text('in_near_code'),
  in_near: text('in_near'),
  city_code: text('city_code'),
  city_name: text('city_name'),
  city_description: text('city_description'),
  street: text('street'),
  highway_name: text('highway_name'),
  
  // Railroad information
  separate_track: text('separate_track'),
  same_track: text('same_track'),
  same_track_railroad1: text('same_track_railroad1'),
  railroad_division: text('railroad_division'),
  railroad_subdivision: text('railroad_subdivision'),
  branch_name: text('branch_name'),
  railroad_milepost_number: text('railroad_milepost_number'),
  nearest_timetable_station: text('nearest_timetable_station'),
  timetable_station: text('timetable_station'),
  parent_railroad_code: text('parent_railroad_code'),
  
  // Crossing details
  crossing_owner_code: text('crossing_owner_code'),
  crossing_type_code: text('crossing_type_code'),
  crossing_type: text('crossing_type'),
  crossing_purpose_code: text('crossing_purpose_code'),
  crossing_purpose: text('crossing_purpose'),
  crossing_position_code: text('crossing_position_code'),
  crossing_position: text('crossing_position'),
  
  // Train service information
  type_of_train_service_ids: text('type_of_train_service_ids'),
  type_of_train_service_id1: text('type_of_train_service_id1'),
  type_of_train_service1: text('type_of_train_service1'),
  lt_passenger_train_per_day: text('lt_passenger_train_per_day'),
  number_passenger_train_per_day: integer('number_passenger_train_per_day'),
  
  // Development and environment information
  development_type_code: text('development_type_code'),
  development_type: text('development_type'),
  adjacent_crossing: text('adjacent_crossing'),
  whistle_ban_code: text('whistle_ban_code'),
  whistle_ban: text('whistle_ban'),
  whistle_date: date('whistle_date'),
  hsr_corridor_id: text('hsr_corridor_id'),
  
  // Geolocation
  latitude: numeric('latitude', { precision: 9, scale: 6 }),
  longitude: numeric('longitude', { precision: 9, scale: 6 }),
  lat_long_source_code: text('lat_long_source_code'),
  lat_long_source: text('lat_long_source'),
  
  // Contact information
  state_narrative: text('state_narrative'),
  emergency_telephone_number: text('emergency_telephone_number'),
  railroad_contact_telephone_number: text('railroad_contact_telephone_number'),
  state_contact_telephone_number: text('state_contact_telephone_number'),
  
  // Train movements
  total_daylight_thru_trains: integer('total_daylight_thru_trains'),
  total_nighttime_thru_trains: integer('total_nighttime_thru_trains'),
  total_switching_trains: integer('total_switching_trains'),
  total_transit_trains: integer('total_transit_trains'),
  movements_per_day_code: text('movements_per_day_code'),
  movements_per_day: text('movements_per_day'),
  trains_per_year: integer('trains_per_year'),
  
  // Speed information
  maximum_timetable_speed: integer('maximum_timetable_speed'),
  minimum_speed_range_over_crossing: integer('minimum_speed_range_over_crossing'),
  maximum_speed_range_over_crossing: integer('maximum_speed_range_over_crossing'),
  
  // Track information
  number_of_main_tracks: integer('number_of_main_tracks'),
  number_of_siding_tracks: integer('number_of_siding_tracks'),
  number_of_yard_tracks: integer('number_of_yard_tracks'),
  number_of_transit_tracks: integer('number_of_transit_tracks'),
  number_of_industry_tracks: integer('number_of_industry_tracks'),
  other_track: text('other_track'),
  
  // Detection and warning systems
  train_detection_ids: text('train_detection_ids'),
  train_detection_id1: text('train_detection_id1'),
  train_detection1: text('train_detection1'),
  track_signaled: text('track_signaled'),
  signs_or_signals: text('signs_or_signals'),
  number_crossbuck_assemblies: integer('number_crossbuck_assemblies'),
  number_stop_signs: integer('number_stop_signs'),
  advance_warnings: text('advance_warnings'),
  advance_warning1: text('advance_warning1'),
  advance_warning_text1: text('advance_warning_text1'),
  channel_device_median_code: text('channel_device_median_code'),
  channel_device_median: text('channel_device_median'),
  ens_sign_displayed: text('ens_sign_displayed'),
  other_mutcd_signs: text('other_mutcd_signs'),
  
  // Safety equipment
  count_roadway_gate_arms: integer('count_roadway_gate_arms'),
  count_cantilever_over_lane: integer('count_cantilever_over_lane'),
  count_cantilever_no_lane: integer('count_cantilever_no_lane'),
  count_mast_mounted_flashing_light: integer('count_mast_mounted_flashing_light'),
  mast_mounted_flashing_backlight: text('mast_mounted_flashing_backlight'),
  mast_mounted_flashing_sidelight: text('mast_mounted_flashing_sidelight'),
  count_flashing_light_pair: integer('count_flashing_light_pair'),
  highway_traffic_signal: text('highway_traffic_signal'),
  number_of_bells: integer('number_of_bells'),
  count_other_flashing_lights: integer('count_other_flashing_lights'),
  hwy_traffic_signal_interconn_code: text('hwy_traffic_signal_interconn_code'),
  hwy_traffic_signal_interconn: text('hwy_traffic_signal_interconn'),
  
  // Other information
  traffic_lane: text('traffic_lane'),
  school_bus_route: text('school_bus_route'),
  ccm_qz_id: text('ccm_qz_id'),
  thr_request_no: text('thr_request_no'),
  report_type: text('report_type'),
  crossing_closed: text('crossing_closed'),
  report_status: text('report_status'),
  agency_id: text('agency_id'),
  reporting_railroad_company_grouping: text('reporting_railroad_company_grouping'),
  reporting_railroad_smt_grouping: text('reporting_railroad_smt_grouping'),
  reporting_parent_railroad_code: text('reporting_parent_railroad_code'),
  reporting_parent_railroad_name: text('reporting_parent_railroad_name'),
  reporting_railroad_holding_company: text('reporting_railroad_holding_company'),
  wd_code: text('wd_code'),
  multiple_forms_filed: text('multiple_forms_filed'),
  geocoded_latitude: text('geocoded_latitude'),
  geocoded_longitude: text('geocoded_longitude'),
  url: text('url'),
 
});

// Type for the crossing data
export type RailroadCrossing = typeof railroadCrossings.$inferSelect;
export type NewRailroadCrossing = typeof railroadCrossings.$inferInsert;