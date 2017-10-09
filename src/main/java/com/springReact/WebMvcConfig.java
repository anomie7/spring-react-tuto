package com.springReact;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@Configuration
public class WebMvcConfig extends WebMvcConfigurerAdapter {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		super.addResourceHandlers(registry);
		if(!registry.hasMappingForPattern("/webjars/**")) {
			registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
		}
		if(!registry.hasMappingForPattern("/favicon.ico")) {
			registry.addResourceHandler("/favicon.ico").addResourceLocations("/favicon.ico");
		}
		if(!registry.hasMappingForPattern("/main.css")) {
			registry.addResourceHandler("/main.css").addResourceLocations("classpath:/static/main.css");
		}
	}
	
	
}
