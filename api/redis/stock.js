exports.get = function (redis, key, callback) {

    redis.get(key, function (err, r) {
        if (err) {
            console.log(err)
            callback(err, null)
            return
        }
        callback(null, r)
    });
}

exports.add = function (redis, key, value, callback) {

    redis.get(key, function (err, r) {
        if (err) {
            console.log(err)
            callback(err, null)
            return
        }
        if (r) {
            let c = JSON.parse(r)
            c.push(value)
            redis.set(key, JSON.stringify(c));
            callback(null, c)
            return
        }
        let c = [value]
        redis.set(cartid, JSON.stringify(c));
        callback(null, c)
        return

    });

}

exports.delete = function (redis, key, index, callback) {

    redis.get(key, function (err, r) {
        if (err) {
            console.log(err)
            callback(err, null)
            return
        }
        if (r) {
            let c = JSON.parse(r)
            if (index <= c.length) {
                c.splice(index, 1)
                if (c.length > 0) {
                    redis.set(key, JSON.stringify(c));
                } else {
                    console.log(`redis: no stocks. Removing key ${key}`)
                    redis.del(key)
                }

                callback(null, c)
                return
            }
            callback('Out of bounds', null)
        }

    });

}