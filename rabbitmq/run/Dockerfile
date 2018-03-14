FROM rabbitmq:3.6.11

RUN rabbitmq-plugins enable --offline rabbitmq_management
RUN rabbitmq-plugins enable rabbitmq_web_mqtt

EXPOSE 15672
EXPOSE 1883
EXPOSE 8883
EXPOSE 15675
