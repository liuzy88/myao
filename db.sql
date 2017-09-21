CREATE TABLE `myao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hash` varchar(64) NOT NULL,
  `img` varchar(64) NOT NULL,
  `tag` varchar(64) DEFAULT '',
  `text` varchar(2048) DEFAULT '',
  `like` int(11) DEFAULT '0',
  `ctime` datetime DEFAULT CURRENT_TIMESTAMP,
  `cdn` tinyint(4) DEFAULT '0',
  PRIMARY KEY (`id`,`hash`),
  UNIQUE KEY `unique_id` (`id`),
  UNIQUE KEY `unique_hash` (`hash`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
