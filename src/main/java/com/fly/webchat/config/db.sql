--建库建表代码
create database if not exists oceanchat charset utf8mb4;
use oceanchat;
drop table if exists user_info;
CREATE TABLE `user_info` (
                             `userId` INT ( 11 ) NOT NULL AUTO_INCREMENT,
                             `username` VARCHAR ( 127 ) NOT NULL unique,
                             `password` VARCHAR ( 127 ) NOT NULL,
                             `create_time` DATETIME DEFAULT now(),
                             `update_time` DATETIME DEFAULT now(),
                             PRIMARY KEY ( `userId` )
) ENGINE = INNODB DEFAULT CHARSET = utf8mb4;

-- 创建好友表
drop table if exists friend_info;
create table friend_info (
                             userId int not null ,
                             friendId int not null
);


-- 创建会话表
drop table if exists msg_session;
create table msg_session (
                             sessionId int primary key auto_increment,
                             lastTime datetime -- 上次访问时间
);

insert into msg_session values(1, '2000-05-01 00:00:00');
insert into msg_session values(2, '2000-06-01 00:00:00');

-- 创建会话和用户的关联表
drop table if exists msg_session_user;
create table msg_session_user (
                                  sessionId int,
                                  userId int
);

-- 1 号会话里有fly和鞠婧祎
insert into msg_session_user values(1, 1), (1, 10);
-- 2 号会话里有fly和八重神子
insert into msg_session_user values(2, 1), (2, 11);