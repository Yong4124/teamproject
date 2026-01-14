package com.example.order_orderlist.config;

import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    // 큐 이름을 여기서 직접 상수로 선언
    public static final String ORDER_REQUEST_QUEUE = "order.request.queue";  // 발주 요청 큐 이름

    // 큐 생성
    @Bean
    public Queue orderRequestQueue() {
        return new Queue(ORDER_REQUEST_QUEUE);  // 직접 선언한 상수 사용
    }

    // 메시지 컨버터 (JSON 직렬화/역직렬화)
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // RabbitTemplate 설정
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
