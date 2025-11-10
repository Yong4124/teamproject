package com.example.product.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    public static final String PRODUCt_REQUEST_QUEUE = "product.request";
    public static final String PRODUCT_RESPONSE_QUEUE = "product.response";

    @Bean
    public Queue reviewRequestQueue() { return new Queue(PRODUCt_REQUEST_QUEUE); }

    @Bean
    public Queue reviewResponseQueue() { return new Queue(PRODUCT_RESPONSE_QUEUE); }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
