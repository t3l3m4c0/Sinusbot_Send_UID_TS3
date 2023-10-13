/*
 * Copyright (C) 2016 Patrick15a <patrick.loebbe@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/*
 *
 * @author Patrick15a <patrick15a@myfilehost.de
 * Modify it by Telémaco for send UID with %uid%
 */
registerPlugin({
    name: 'WelcomeMessge+',
    version: '1.0.6_Quick-Fix',
        engine: '>= 0.9.21',
        backends: ['ts3'],
    description: 'Send a WelcomeMessage to a user when he joined the Server.',
    author: 'Patrick15a <patrick15a@myfilehost.de>',
    vars: [
                {
                        name: 'msg',
                        title: 'WelcomeMessage (Available variables: "%prefix%", "%username%", "%userOnlineCount%", "%teamOnlineCount%", "%totalConnections%")',
                        type: 'multiline',
                        placeholder: 'Default:\n%prefix% Welcome %username%,\n%prefix% you\'ve been here %totalConnections% times.\n%prefix% Now are %userOnlineCount% user/s and %teamOnlineCount% team member/s online.\n%prefix% We hope you have fun on our server!\n%prefix% Use "!wmp ignore" to disable the WelcomeMessage for you. With "!wmp unignore" you will receive it again.'
                },
                {
                        name: 'ignoreGroups',
                        title: "Ignore Groups (like MusicBot Group and Team Groups, ignore groups will also not recive the Welcome Message) (ServerGroupID's)",
                        type: 'strings'
                },
                {
                        name: 'teamGroups',
                        title: 'Team Groups for %t (ServerGroupID\'s)',
                        type: 'strings'
                },
                {
                        name: 'ignoreClients',
                        title: "Ignore Clients (with the command !wmp ignore, the user can add himself to the Ignore Clients list, unignore with !wmp unignore) (UniqueId's)",
                        type: 'strings'
                },
                {
                        name: 'prefix',
                        title: 'Prefix',
                        type: 'string',
                        placeholder: 'Default: [b][COLOR=#aa0000][[/COLOR][COLOR=#01DF01]WelcomeMessage[COLOR=#0040FF]+[/COLOR][/COLOR][COLOR=#aa0000]][/COLOR][/b]'
                }
        ]
}, function(sinusbot, config) {

        var engine = require('engine');
        var backend = require('backend');
        var event = require('event');
        var ch;

        if (typeof config.ignoreGroups == 'undefined') {
                var ignoreGroups = [""];
        } else {
                var ignoreGroups = config.ignoreGroups;
        }
        if (typeof config.teamGroups == 'undefined') {
                var teamGroups = [""];
        } else {
                var teamGroups = config.teamGroups;
        }
        if (typeof config.ignoreClients == 'undefined') {
                config.ignoreClients = new Array;
                engine.saveConfig(config);
        }
        if (typeof config.prefix == 'undefined' || config.prefix === '') {
                var prefix = '[b][COLOR=#aa0000][[/COLOR][COLOR=#01DF01]WelcomeMessage[COLOR=#0040FF]+[/COLOR][/COLOR][COLOR=#aa0000]][/COLOR][/b]';
        } else {
                var prefix = config.prefix;
        }
        if (typeof config.msg == 'undefined' || config.msg === '') {
                var msg = '%prefix% Welcome %username%,\n%prefix% you\'ve been here %totalConnections% times.\n%prefix% Now are %userOnlineCount% user/s and %teamOnlineCount% team member/s online.\n%prefix% We hope you have fun on our server!\n%prefix% Use "!wmp ignore" to disable the WelcomeMessage for you. With "!wmp unignore" you will receive it again.';
        } else {
                var msg = config.msg;
        }

        event.on('clientMove', function(ev) {

                setTimeout(function() {

                        ch = backend.getChannelByID(config.channel);

                        if (typeof ev.fromChannel == 'undefined' && !isInGroup(ev.client, ignoreGroups) && config.ignoreClients.indexOf(ev.client.uid()) < 0 && !ev.client.isSelf()) {

                                msg_now = msg.replace(/%username%/g, ev.client.name());
                                msg_now = msg_now.replace(/%userOnlineCount%/g, playersOnline());
                                msg_now = msg_now.replace(/%totalConnections%/g, totalConnections(ev.client.id()));
                                msg_now = msg_now.replace(/%teamOnlineCount%/g, teamOnline());
                                msg_now = msg_now.replace(/%prefix%/g, prefix);
/* Modificación de T3l3m4c0 para poder enviar el UID con %uid% */
                                msg_now = msg_now.replace(/%uid%/g, ev.client.uid());
                                ev.client.chat(msg_now);
                        }
                }, 1000);

        });

        event.on('chat', function(ev) {

                switch(ev.text) {

                        case '!wmp ignore':
                                config.ignoreClients.push(ev.client.uid())
                                ev.client.chat(' Ya no volverás a ver este mensage cuando te conectes al servidor.');
                                engine.saveConfig(config);
                        break;

                        case '!wmp unignore':
                                config.ignoreClients.splice(config.ignoreClients.indexOf(ev.client.uid()), 1);
                                ev.client.chat(' Cuando conectes al servidor verás los mensages de bienvenida');
                                engine.saveConfig(config);
                        break;

                }

        });

        function totalConnections(cid) {

                client = backend.getClientByID(cid);
                tcon = client.getTotalConnections();
                return tcon;
        }
        function playersOnline() {

                clients = backend.getClients();
                var ignoreMembers = 0;

                clients.forEach(function(client) {

                        if (isInGroup(client, ignoreGroups) === true) {
                                ignoreMembers++
                        }
                });

                return clients.length - ignoreMembers;
        }
        function teamOnline() {
                var clients = backend.getClients();
                var teamMembers = 0;

                clients.forEach(function(client) {

                        if (isInGroup(client, teamGroups) === true) {
                                teamMembers++
                        }
                });

                return teamMembers;
        }
        function isInGroup(client, groups) {
                var inGroup = false;
                client.getServerGroups().forEach(function(group) {

                        if (groups.indexOf(group.id()) != -1) {
                                inGroup = true;
                        }

                });

                return inGroup;
        }
});
