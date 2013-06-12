
/*
Copyright (c) 2010 Ryan Schuft (ryan.schuft@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
  This code is based in part on the work done in Ruby to support
  infection as part of Ruby on Rails in the ActiveSupport's Inflector
  and Inflections classes.  It was initally ported to Javascript by
  Ryan Schuft (ryan.schuft@gmail.com) in 2007.

  The code is available at http://code.google.com/p/inflection-js/

  The basic usage is:
    1. Include this script on your web page.
    2. Call functions on any String object in Javascript

  Currently implemented functions:

    String.pluralize(plural) == String
      renders a singular English language noun into its plural form
      normal results can be overridden by passing in an alternative

    String.singularize(singular) == String
      renders a plural English language noun into its singular form
      normal results can be overridden by passing in an alterative

    String.camelize(lowFirstLetter) == String
      renders a lower case underscored word into camel case
      the first letter of the result will be upper case unless you pass true
      also translates "/" into "::" (underscore does the opposite)

    String.underscore() == String
      renders a camel cased word into words seperated by underscores
      also translates "::" back into "/" (camelize does the opposite)

    String.humanize(lowFirstLetter) == String
      renders a lower case and underscored word into human readable form
      defaults to making the first letter capitalized unless you pass true

    String.capitalize() == String
      renders all characters to lower case and then makes the first upper

    String.dasherize() == String
      renders all underbars and spaces as dashes

    String.titleize() == String
      renders words into title casing (as for book titles)

    String.demodulize() == String
      renders class names that are prepended by modules into just the class

    String.tableize() == String
      renders camel cased singular words into their underscored plural form

    String.classify() == String
      renders an underscored plural word into its camel cased singular form

    String.foreign_key(dropIdUbar) == String
      renders a class name (camel cased singular noun) into a foreign key
      defaults to seperating the class from the id with an underbar unless
      you pass true

    String.ordinalize() == String
      renders all numbers found in the string into their sequence like "22nd"
*/

var InflectionJS;

/*
  This sets up some constants for later use
  This should use the window namespace variable if available
*/
InflectionJS = {
    /*
      This is a list of nouns that use the same form for both singular and plural.
      This list should remain entirely in lower case to correctly match Strings.
    */
    uncountable_words: [
        'equipment', 'information', 'rice', 'money', 'species', 'series',
        'fish', 'sheep', 'moose', 'deer', 'news'
    ],

    /*
      These rules translate from the singular form of a noun to its plural form.
    */
    plural_rules: [
        [new RegExp('(m)an$', 'gi'),                 '$1en'],
        [new RegExp('(pe)rson$', 'gi'),              '$1ople'],
        [new RegExp('(child)$', 'gi'),               '$1ren'],
        [new RegExp('^(ox)$', 'gi'),                 '$1en'],
        [new RegExp('(ax|test)is$', 'gi'),           '$1es'],
        [new RegExp('(octop|vir)us$', 'gi'),         '$1i'],
        [new RegExp('(alias|status|by)$', 'gi'),     '$1es'],
        [new RegExp('(bu)s$', 'gi'),                 '$1ses'],
        [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
        [new RegExp('([ti])um$', 'gi'),              '$1a'],
        [new RegExp('sis$', 'gi'),                   'ses'],
        [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'),  '$1$2ves'],
        [new RegExp('(hive)$', 'gi'),                '$1s'],
        [new RegExp('([^aeiouy]|qu)y$', 'gi'),       '$1ies'],
        [new RegExp('(x|ch|ss|sh)$', 'gi'),          '$1es'],
        [new RegExp('(matr|vert|ind)ix|ex$', 'gi'),  '$1ices'],
        [new RegExp('([m|l])ouse$', 'gi'),           '$1ice'],
        [new RegExp('(quiz)$', 'gi'),                '$1zes'],
        [new RegExp('s$', 'gi'),                     's'],
        [new RegExp('$', 'gi'),                      's']
    ],

    /*
      These rules translate from the plural form of a noun to its singular form.
    */
    singular_rules: [
        [new RegExp('(m)en$', 'gi'),                                                       '$1an'],
        [new RegExp('(pe)ople$', 'gi'),                                                    '$1rson'],
        [new RegExp('(child)ren$', 'gi'),                                                  '$1'],
        [new RegExp('([ti])a$', 'gi'),                                                     '$1um'],
        [new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$','gi'), '$1$2sis'],
        [new RegExp('(hive)s$', 'gi'),                                                     '$1'],
        [new RegExp('(tive)s$', 'gi'),                                                     '$1'],
        [new RegExp('(curve)s$', 'gi'),                                                    '$1'],
        [new RegExp('([lr])ves$', 'gi'),                                                   '$1f'],
        [new RegExp('([^fo])ves$', 'gi'),                                                  '$1fe'],
        [new RegExp('([^aeiouy]|qu)ies$', 'gi'),                                           '$1y'],
        [new RegExp('(s)eries$', 'gi'),                                                    '$1eries'],
        [new RegExp('(m)ovies$', 'gi'),                                                    '$1ovie'],
        [new RegExp('(x|ch|ss|sh)es$', 'gi'),                                              '$1'],
        [new RegExp('([m|l])ice$', 'gi'),                                                  '$1ouse'],
        [new RegExp('(bus)es$', 'gi'),                                                     '$1'],
        [new RegExp('(o)es$', 'gi'),                                                       '$1'],
        [new RegExp('(shoe)s$', 'gi'),                                                     '$1'],
        [new RegExp('(cris|ax|test)es$', 'gi'),                                            '$1is'],
        [new RegExp('(octop|vir)i$', 'gi'),                                                '$1us'],
        [new RegExp('(alias|status)es$', 'gi'),                                            '$1'],
        [new RegExp('^(ox)en', 'gi'),                                                      '$1'],
        [new RegExp('(vert|ind)ices$', 'gi'),                                              '$1ex'],
        [new RegExp('(matr)ices$', 'gi'),                                                  '$1ix'],
        [new RegExp('(quiz)zes$', 'gi'),                                                   '$1'],
        [new RegExp('s$', 'gi'),                                                           '']
    ],

    /*
      This is a list of words that should not be capitalized for title case
    */
    non_titlecased_words: [
        'and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of', 'at',
        'by', 'from', 'into', 'on', 'onto', 'off', 'out', 'in', 'over',
        'with', 'for'
    ],

    /*
      These are regular expressions used for converting between String formats
    */
    id_suffix: new RegExp('(_ids|_id)$', 'g'),
    underbar: new RegExp('_', 'g'),
    space_or_underbar: new RegExp('[\ _]', 'g'),
    uppercase: new RegExp('([A-Z])', 'g'),
    underbar_prefix: new RegExp('^_'),

    /*
      This is a helper method that applies rules based replacement to a String
      Signature:
        InflectionJS.apply_rules(str, rules, skip, override) == String
      Arguments:
        str - String - String to modify and return based on the passed rules
        rules - Array: [RegExp, String] - Regexp to match paired with String to use for replacement
        skip - Array: [String] - Strings to skip if they match
        override - String (optional) - String to return as though this method succeeded (used to conform to APIs)
      Returns:
        String - passed String modified by passed rules
      Examples:
        InflectionJS.apply_rules("cows", InflectionJs.singular_rules) === 'cow'
    */
    apply_rules: function(str, rules, skip, override) {
        if (override) {
            str = override;
        }
        else {
            var ignore = (skip.indexOf(str.toLowerCase()) > -1);
            if (!ignore) {
                for (var x = 0; x < rules.length; x++) {
                    if (str.match(rules[x][0])) {
                        str = str.replace(rules[x][0], rules[x][1]);
                        break;
                    }
                }
            }
        }
        return str;
    }
};

/*
  This function adds plurilization support to every String object
    Signature:
      String.pluralize(plural) == String
    Arguments:
      plural - String (optional) - overrides normal output with said String
    Returns:
      String - singular English language nouns are returned in plural form
    Examples:
      "person".pluralize() == "people"
      "octopus".pluralize() == "octopi"
      "Hat".pluralize() == "Hats"
      "person".pluralize("guys") == "guys"
*/
InflectionJS.pluralize = function(string, plural) {
    return this.apply_rules(
    string,
    this.plural_rules,
    this.uncountable_words,
    plural
    );
};

/*
 This function adds singularization support to every String object
 Signature:
 String.singularize(singular) == String
 Arguments:
 singular - String (optional) - overrides normal output with said String
 Returns:
 String - plural English language nouns are returned in singular form
 Examples:
 "people".singularize() == "person"
 "octopi".singularize() == "octopus"
 "Hats".singularize() == "Hat"
 "guys".singularize("person") == "person"
 */
InflectionJS.singularize = function(string, singular) {
    return this.apply_rules(
    string,
    this.singular_rules,
    this.uncountable_words,
    singular
    );
};

/*
 This function adds camelization support to every String object
 Signature:
 String.camelize(lowFirstLetter) == String
 Arguments:
 lowFirstLetter - boolean (optional) - default is to capitalize the first
 letter of the results... passing true will lowercase it
 Returns:
 String - lower case underscored words will be returned in camel case
 additionally '/' is translated to '::'
 Examples:
 "message_properties".camelize() == "MessageProperties"
 "message_properties".camelize(true) == "messageProperties"
 */
InflectionJS.camelize = function(string, lowFirstLetter, dontLowercaseBefore) {
    if (!dontLowercaseBefore) {
      string = string.toLowerCase();
    }
    var str_path = string.split('/');
    for (var i = 0; i < str_path.length; i++) {
        var str_arr = str_path[i].split('_');
        var initX = ((lowFirstLetter && i + 1 === str_path.length) ? (1) : (0));
        for (var x = initX; x < str_arr.length; x++) {
            str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1);
        }
        str_path[i] = str_arr.join('');
    }
    string = str_path.join('::');
    return string;
};

/*
 This function adds underscore support to every String object
 Signature:
 String.underscore() == String
 Arguments:
 N/A
 Returns:
 String - camel cased words are returned as lower cased and underscored
 additionally '::' is translated to '/'
 Examples:
 "MessageProperties".camelize() == "message_properties"
 "messageProperties".underscore() == "message_properties"
 */
InflectionJS.underscore = function(string) {
    var str_path = string.split('::');
    for (var i = 0; i < str_path.length; i++) {
        str_path[i] = str_path[i].replace(this.uppercase, '_$1');
        str_path[i] = str_path[i].replace(this.underbar_prefix, '');
    }
    string = str_path.join('/').toLowerCase();
    return string;
};

/*
 This function adds humanize support to every String object
 Signature:
 String.humanize(lowFirstLetter) == String
 Arguments:
 lowFirstLetter - boolean (optional) - default is to capitalize the first
 letter of the results... passing true will lowercase it
 Returns:
 String - lower case underscored words will be returned in humanized form
 Examples:
 "message_properties".humanize() == "Message properties"
 "message_properties".humanize(true) == "message properties"
 */
InflectionJS.humanize = function(string, lowFirstLetter) {
    string = string.toLowerCase();
    string = string.replace(this.id_suffix, '');
    string = string.replace(this.underbar, ' ');
    if (!lowFirstLetter) {
        string = this.capitalize(string);
    }
    return string;
};

/*
 This function adds capitalization support to every String object
 Signature:
 String.capitalize() == String
 Arguments:
 N/A
 Returns:
 String - all characters will be lower case and the first will be upper
 Examples:
 "message_properties".capitalize() == "Message_properties"
 "message properties".capitalize() == "Message properties"
 */
InflectionJS.capitalize = function(string, dontLowercaseFirst) {
    if (!dontLowercaseFirst) {
        string = string.toLowerCase();
    }
    string = string.substring(0, 1).toUpperCase() + string.substring(1);
    return string;
};

/*
 This function adds decapitalization support to every String object
 Signature:
 String.decapitalize() == String
 Arguments:
 N/A
 Returns:
 String - all characters will be lower case and the first will be upper
 Examples:
 "Message_properties".capitalize() == "message_properties"
 "Message properties".capitalize() == "message properties"
 */
InflectionJS.decapitalize = function(string) {
    string = string.substring(0, 1).toLowerCase() + string.substring(1);
    return string;
};

/*
 This function adds dasherization support to every String object
 Signature:
 String.dasherize() == String
 Arguments:
 N/A
 Returns:
 String - replaces all spaces or underbars with dashes
 Examples:
 "message_properties".capitalize() == "message-properties"
 "Message Properties".capitalize() == "Message-Properties"
 */
InflectionJS.dasherize = function(string) {
    string = string.replace(this.space_or_underbar, '-');
    return string;
};

/*
  This function adds titleize support to every String object
    Signature:
      String.titleize() == String
    Arguments:
      N/A
    Returns:
      String - capitalizes words as you would for a book title
    Examples:
      "message_properties".titleize() == "Message Properties"
      "message properties to keep".titleize() == "Message Properties to Keep"
*/
InflectionJS.titleize = function(string) {
    string = string.toLowerCase();
    string = string.replace(this.underbar, ' ');
    var str_arr = string.split(' ');
    for (var x = 0; x < str_arr.length; x++) {
        var d = str_arr[x].split('-');
        for (var i = 0; i < d.length; i++) {
            if (this.non_titlecased_words.indexOf(d[i].toLowerCase()) < 0) {
                d[i] = this.capitalize(d[i]);
            }
        }
        str_arr[x] = d.join('-');
    }
    string = str_arr.join(' ');
    string = string.substring(0, 1).toUpperCase() + string.substring(1);
    return string;
};

/*
  This function adds demodulize support to every String object
    Signature:
      String.demodulize() == String
    Arguments:
      N/A
    Returns:
      String - removes module names leaving only class names (Ruby style)
    Examples:
      "Message::Bus::Properties".demodulize() == "Properties"
*/
InflectionJS.demodulize = function(string) {
    var str_arr = string.split('::');
    string = str_arr[str_arr.length - 1];
    return string;
};

/*
  This function adds tableize support to every String object
    Signature:
      String.tableize() == String
    Arguments:
      N/A
    Returns:
      String - renders camel cased words into their underscored plural form
    Examples:
      "MessageBusProperty".tableize() == "message_bus_properties"
*/
InflectionJS.tableize = function(string) {
    string = this.pluralize(this.underscore(string));
    return string;
};

/*
  This function adds classification support to every String object
    Signature:
      String.classify() == String
    Arguments:
      N/A
    Returns:
      String - underscored plural nouns become the camel cased singular form
    Examples:
      "message_bus_properties".classify() == "MessageBusProperty"
*/
InflectionJS.classify = function(string) {
    string = this.singularize(this.camelize(string));
    return string;
};

/*
  This function adds foreign key support to every String object
    Signature:
      String.foreign_key(dropIdUbar) == String
    Arguments:
      dropIdUbar - boolean (optional) - default is to seperate id with an
        underbar at the end of the class name, you can pass true to skip it
    Returns:
      String - camel cased singular class names become underscored with id
    Examples:
      "MessageBusProperty".foreign_key() == "message_bus_property_id"
      "MessageBusProperty".foreign_key(true) == "message_bus_propertyid"
*/
InflectionJS.foreign_key = function(string, dropIdUbar) {
    string = this.underscore(this.demodulize(string)) + ((dropIdUbar) ? ('') : ('_')) + 'id';
    return string;
};

/*
  This function adds ordinalize support to every String object
    Signature:
      String.ordinalize() == String
    Arguments:
      N/A
    Returns:
      String - renders all found numbers their sequence like "22nd"
    Examples:
      "the 1 pitch".ordinalize() == "the 1st pitch"
*/
InflectionJS.ordinalize = function(string) {
    string += '';
    var str_arr = string.split(' ');
    for (var x = 0; x < str_arr.length; x++) {
        var i = parseInt(str_arr[x], 10);
        if (i === NaN) {
            var ltd = str_arr[x].substring(str_arr[x].length - 2);
            var ld = str_arr[x].substring(str_arr[x].length - 1);
            var suf = "th";
            if (ltd != "11" && ltd != "12" && ltd != "13") {
                if (ld === "1") {
                    suf = "st";
                }
                else if (ld === "2") {
                    suf = "nd";
                }
                else if (ld === "3") {
                    suf = "rd";
                }
            }
            str_arr[x] += suf;
        }
    }
    string = str_arr.join(' ');
    return string;
};

// BEGIN MIGRATION SCRIPT

db.cActivities.drop();
db.cFolloweeBuckets.drop();
db.cFollowerBuckets.drop();
db.cInstalleeBuckets.drop();
db.cInstallerBuckets.drop();
db.cLikeeBuckets.drop();
db.cLikerBuckets.drop();
db.cNewMemberBuckets.drop();
db.cReplieeBuckets.drop();
db.cReplierBuckets.drop();
db.cronjobs.drop();
db.jAccount.drop(); // jAccount, not jAccounts
db.jActivities.drop();
db.jApplications.drop();
db.jActivityCaches.drop();
db.jChannels.drop();
db.jCodesnipActivities.drop();
db.jDatabases.drop();
db.jEnvironments.drop();
db.jFeeds.drop();
db.jGroups.drop();
db.jKiteClusters.drop();
db.jKiteConnections.drop();
db.jLinks.drop();
db.jLinkActivities.drop();
db.jMounts.drop();
db.jPermissionSets.drop();
db.jQuestionActivities.drop();
db.jRegistrationPreferences.drop();
db.jRepos.drop();
db.jSessions.drop();
db.jStatusActivities.drop();
db.jTutorialLists.drop();
db.jTutorials.drop();
db.module2s.drop();
db.modules.drop();
db.modules_trash.drop();
db.relationships_trash.drop();
db.replies.drop();
db.sessions.drop();
db.svnusers.drop();
db.tags.drop();
db.ttt.drop();
db.uniqueids.drop();
db.jPermissions.drop();

print('drop app storages');
db.jAppStorages.drop();
db.relationships.remove({
  $or: [
    {targetName: 'JAppStorage'},
    {sourceName: 'JAppStorage'}
  ]
});
print('...done');

print('reclaim our name from Tim Ahong...');
db.jNames.update({name:'koding'},{$set:{name:'timahong'}});
db.jAccounts.update(
  {'profile.nickname':'koding'},
  {$set:{'profile.nickname':'timahong'}}
);
db.jUsers.update({username:'koding'},{$set:{username:'timahong'}});
print('...done');



print('-- USERS --');

print('set every account\'s "onlineStatus" to "offline"');
db.jAccounts.update({}, {$set:{onlineStatus:'offline'}}, false /*upsert*/, true /*multi*/);
print('...done');


print('set every user\'s "onlineStatus.actual" to "offline"');
db.jUsers.update({}, {$set:{'actual.onlineStatus':'offline'}}, false /*upsert*/, true /*multi*/);
print('...done');


print('grant every user a sequential uid');
var uid = 1e6;
db.jUsers.find().toArray().forEach(function (u) {
  db.jUsers.update(u, {$set:{uid:uid++}});
});
print('...done');

print('-- done with USERS --');



print('-- GROUPS --');

print('delete junk groups');
db.jGroups.drop();
print('...done');


print('clean up any junk relationships');
db.relationships.remove({
  $or: [
    {targetName:'JGroup'},
    {sourceName:'JGroup'}
  ]
});
print('...done');


print('create the Koding group');
db.jGroups.save({
  "body" : "Say goodbye to your localhost",
  "counts" : { "members" : db.jAccounts.count() },
  "customize" : {
    "background" : {
      "customType" : "defaultImage",
      "customValue" : "1"
    }
  },
  "parent" : { },
  "privacy" : "private",
  "slug" : "koding",
  "title" : "Koding",
  "visibility" : "visible"
});
print('...done');


print('add everyone as a member to the "koding" group');
var kid = db.jGroups.findOne({slug:'koding'})._id;
db.jAccounts.find().toArray().forEach(function (a) {
  db.relationships.save({
    targetName: 'JAccount',
    targetId: a._id,
    sourceName: 'JGroup',
    sourceId: kid,
    as: 'member'
  });
});
print('...done');


print('add group slugs to every collection that needs them');
[
  'jCodeShares',
  'jCodeSnips',
  'jDiscussions',
  'jInvitationRequests',
  'jBlogPosts',
  'jOpinions',
  'jPosts',
  'jStatusUpdates',
  'jTags',
  'jTutorials',
  'jTutorialLists',
  'jVocabularies'
].forEach(function (c) {
  print('add group slugs to collection: ' + c);
  db[c].update({}, {$set:{group:'koding'}}, false /*upsert*/, true /*multi*/);
});
print('...done');


print('create membership policy for "koding"');
db.jMembershipPolicies.drop();
db.jMembershipPolicies.save({
  "approvalEnabled" : false,
  "dataCollectionEnabled" : false
});
db.relationships.save({
  targetId: db.jMembershipPolicies.findOne()._id,
  targetName: 'JMembershipPolicy',
  sourceId: kid,
  sourceName: 'JGroup',
  as: 'owner'
});
print('...done');


print('create membership policy for "koding"');
db.jPermissionSets.drop();
db.jPermissionSets.save({
  "isCustom" : true,
  "permissions" : [
    {
      "module" : "JGroup",
      "role" : "moderator",
      "permissions" : [
        "open group",
        "list members",
        "create groups",
        "edit groups",
        "edit own groups",
        "query collection",
        "update collection",
        "assure collection",
        "remove documents from collection",
        "view readme"
      ]
    },
    {
      "module" : "JGroup",
      "role" : "member",
      "permissions" : [
        "open group",
        "list members",
        "edit own groups",
        "query collection",
        "view readme"
      ]
    },
    {
      "module" : "JGroup",
      "role" : "guest",
      "permissions" : [
        "open group",
        "list members",
        "view readme"
      ]
    },
    {
      "module" : "CActivity",
      "role" : "moderator",
      "permissions" : [
        "read activity"
      ]
    },
    {
      "module" : "CActivity",
      "role" : "member",
      "permissions" : [
        "read activity"
      ]
    },
    {
      "module" : "CActivity",
      "role" : "guest",
      "permissions" : [
        "read activity"
      ]
    },
    {
      "module" : "JTag",
      "role" : "moderator",
      "permissions" : [
        "read tags",
        "create tags",
        "freetag content",
        "browse content by tag",
        "edit tags",
        "delete tags",
        "edit own tags",
        "delete own tags"
      ]
    },
    {
      "module" : "JTag",
      "role" : "member",
      "permissions" : [
        "read tags",
        "create tags",
        "freetag content",
        "browse content by tag",
        "edit own tags",
        "delete own tags"
      ]
    },
    {
      "module" : "JTag",
      "role" : "guest",
      "permissions" : [
        "read tags"
      ]
    },
    {
      "module" : "JPost",
      "role" : "moderator",
      "permissions" : [
        "read posts",
        "create posts",
        "edit posts",
        "delete posts",
        "edit own posts",
        "delete own posts",
        "reply to posts",
        "like posts"
      ]
    },
    {
      "module" : "JPost",
      "role" : "member",
      "permissions" : [
        "read posts",
        "create posts",
        "edit own posts",
        "delete own posts",
        "reply to posts",
        "like posts"
      ]
    },
    {
      "module" : "JPost",
      "role" : "guest",
      "permissions" : [
        "read posts"
      ]
    },
    {
      "module" : "JVM",
      "role" : "moderator",
      "permissions" : [
        "create vms",
        "list all vms",
        "list default vm"
      ]
    },
    {
      "module" : "JVM",
      "role" : "member",
      "permissions" : [
        "create vms",
        "list all vms",
        "list default vm"
      ]
    },
    {
      "module" : "JGroupBundle",
      "role" : "moderator",
      "permissions" : [
        "change bundle",
        "request bundle change",
        "commission resources"
      ]
    },
    {
      "module" : "JGroupBundle",
      "role" : "member",
      "permissions" : [
        "request bundle change",
        "commission resources"
      ]
    }
  ]
});
db.relationships.save({
  targetId: db.jPermissionSets.findOne()._id,
  targetName: 'JPermissionSet',
  sourceId: kid,
  sourceName: 'JGroup',
  as: 'owner'
});
print('...done');


print('create group bundle for "koding"');
db.jGroupBundles.drop();
db.jGroupBundles.save({
  "overagePolicy" : "allowed"
});
db.relationships.save({
  targetId: db.jMembershipPolicies.findOne(),
  targetName: 'JMembershipPolicy',
  sourceId: kid,
  sourceName: 'JGroup',
  as: 'owner'
});
print('...done');

print('-- done with GROUPS --');



print('-- GUESTS --');

print('set all guest statuses to "pristine"');
db.jGuests.update({}, {$set:{status:'pristine'}}, false /*upsert*/, true /*multi*/);
print('...done');

print('-- done with GUESTS --');



print('-- INVITATION REQUESTS --');

print('set all invitation statuses to "pristine"');
db.jInvitationRequests.find({
  $or:[
    {invitationType:{$exists:false}},
    {status:{$exists:false}}
  ]
}).forEach(function (r) {
  var u = {$set:{}};
  if (r.invitationType == null) {
    u.$set.invitationType = 'invitation';
  }
  if (r.status == null) {
    u.$set.status = 'pending';
  }
  db.jInvitationRequests.update(r, u);
});
print('...done');

print('-- done with INVITATION REQUESTS --');



print('-- MAIL NOTIFICATIONS --');

print('set all "senderEmail" to "hi@koding.com"');
db.jMailNotifications.update({}, {$set:{senderEmail:'hi@koding.com'}});
print('...done');

print('-- done with MAIL NOTIFICATIONS --');



print('-- NAMES --');

print('names can store multiple slugs')
db.jNames.find().toArray().forEach(function (n) {
  var slug = {
    constructorName: n.constructorName,
    collectionName: InflectionJS.decapitalize(InflectionJS.pluralize(n.constructorName)),
    usedAsPath: n.usedAsPath,
    slug: n.slug
  };
  db.jNames.update(n, {
    $set: { slugs: [slug] },
    $unset: {constructorName:1, usedAsPath:1, slug:1}
  });
});
print('...done');


print('create a name for "koding" group');
db.jNames.save({
  "name" : "koding",
  "slugs" : [
    {
      "slug" : "koding",
      "constructorName" : "JGroup",
      "usedAsPath" : "slug",
      "collectionName" : "jGroups"
    }
  ],
});
print('...done');


print('reserve "group" name');
db.jNames.save({
  "name" : "group",
  "slugs" : [],
});
print('...done');

print('-- done with NAMES --');










