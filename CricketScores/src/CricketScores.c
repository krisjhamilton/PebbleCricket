#include <pebble.h>

static Window *window;

static TextLayer *team1_name;
static TextLayer *team1_score;
static TextLayer *team2_name;
static TextLayer *team2_score;
static TextLayer *time_update;

static AppSync sync;
static uint8_t sync_buffer [128];

char time_buffer[32];

enum ScoreKey {
  TEAM1_NAME_KEY = 0x0,
  TEAM1_SCORE_KEY = 0X1,
  TEAM2_NAME_KEY = 0x2,
  TEAM2_SCORE_KEY = 0x3
};

static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
  // text_layer_set_text(text_layer, "Select");
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
  // text_layer_set_text(text_layer, "Up");
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
  // text_layer_set_text(text_layer, "Down");
}

static void sync_error_callback(DictionaryResult dict_error, AppMessageResult app_message_error, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "App Message Sync Error: %d", dict_error);
}

static void sync_tuple_changed_callback(const uint32_t key, const Tuple* new_tuple, const Tuple* old_tuple, void* context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "New: %s", new_tuple->value->cstring);
  switch (key) {
    case TEAM1_NAME_KEY:
      // App Sync keeps new_tuple in sync_buffer, so we may use it directly
      text_layer_set_text(team1_name, new_tuple->value->cstring);
      break;

    case TEAM1_SCORE_KEY:
      text_layer_set_text(team1_score, new_tuple->value->cstring);
      break;

    case TEAM2_NAME_KEY:
      text_layer_set_text(team2_name, new_tuple->value->cstring);
      break;

    case TEAM2_SCORE_KEY:
      text_layer_set_text(team2_score, new_tuple->value->cstring);
      break;
  }
		//Set time this update came in
	time_t temp = time(NULL);	
	struct tm *tm = localtime(&temp);
	strftime(time_buffer, sizeof("Last updated: XX:XX"), "Last updated: %H:%M", tm);
	text_layer_set_text(time_update, (char*) &time_buffer);
}

static void click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
}

static void send_cmd(void) {
  Tuplet value = TupletInteger(1, 1);

  DictionaryIterator *iter;
  app_message_outbox_begin(&iter);

  if (iter == NULL) {
    return;
  }

  dict_write_tuplet(iter, &value);
  dict_write_end(iter);

  app_message_outbox_send();
}

static void window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  team1_name = text_layer_create(GRect(0, 5, 144, 30));
  text_layer_set_font(team1_name, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  text_layer_set_text_alignment(team1_name, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(team1_name));

  team1_score = text_layer_create(GRect(0, 35, 144, 30));
  text_layer_set_font(team1_score, fonts_get_system_font(FONT_KEY_GOTHIC_24));
  text_layer_set_text_alignment(team1_score, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(team1_score));

  team2_name = text_layer_create(GRect(0, 65, 144, 30));
  text_layer_set_font(team2_name, fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD));
  text_layer_set_text_alignment(team2_name, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(team2_name));

  team2_score = text_layer_create(GRect(0, 95, 144, 30));
  text_layer_set_font(team2_score, fonts_get_system_font(FONT_KEY_GOTHIC_24));
  text_layer_set_text_alignment(team2_score, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(team2_score));

  time_update = text_layer_create(GRect(0, 130, 144, 30));
  text_layer_set_font(time_update, fonts_get_system_font(FONT_KEY_GOTHIC_18));
  text_layer_set_text_alignment(time_update, GTextAlignmentCenter);
	//text_layer_set_text(time_update, "Last updated: N/A");
  layer_add_child(window_layer, text_layer_get_layer(time_update));
	

	
  Tuplet initial_values[] = {
    TupletCString(TEAM1_NAME_KEY, ""),
    TupletCString(TEAM1_SCORE_KEY, "Loading..."),
    TupletCString(TEAM2_NAME_KEY, ""),
    TupletCString(TEAM2_SCORE_KEY, "")
  };

  app_sync_init(&sync, sync_buffer, sizeof(sync_buffer), initial_values, ARRAY_LENGTH(initial_values),
      sync_tuple_changed_callback, sync_error_callback, NULL);

  send_cmd();
}

static void window_unload(Window *window) {
  app_sync_deinit(&sync);

  text_layer_destroy(team1_name);
  text_layer_destroy(team1_score);
  text_layer_destroy(team2_name);
  text_layer_destroy(team2_score);
  text_layer_destroy(time_update);
}

//void send_int(uint8_t key, uint8_t cmd)
//{
//	DictionaryIterator *iter;
 //	app_message_outbox_begin(&iter);
 	
// 	Tuplet value = TupletInteger(key, cmd);
// 	dict_write_tuplet(iter, &value);
 	
// 	app_message_outbox_send();
//}


//void tick_callback(struct tm *tick_time, TimeUnits units_changed)
//{
	//Every five minutes
//	if(tick_time->tm_min % 5 == 0)
//	{
		//Send an arbitrary message, the response will be handled by in_received_handler()
//		send_int(5, 5);
//	}
//}


static void init(void) {
  window = window_create();
  window_set_fullscreen(window, false);
  window_set_click_config_provider(window, click_config_provider);
  window_set_window_handlers(window, (WindowHandlers) {
    .load = window_load,
    .unload = window_unload,
  });
  
  const int inbound_size = 128;
  const int outbound_size = 128;
  app_message_open(inbound_size, outbound_size);

	//Register to receive minutely updates
	//tick_timer_service_subscribe(MINUTE_UNIT, tick_callback);
	
  const bool animated = true;
  window_stack_push(window, animated);
}

static void deinit(void) {
	//tick_timer_service_unsubscribe();
  window_destroy(window);
}

int main(void) {
  init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

  app_event_loop();
  deinit();
}
