export class FuseUtils
{
    /**
     * Filter array by string
     *
     * @param mainArr
     * @param searchText
     * @returns {any}
     */
    public static filterArrayByString(mainArr, searchText): any
    {
        return FuseUtils.filterArrayByStringFechas(mainArr, searchText, []);
    }

    public static filterArrayByStringFechas(mainArr, searchText, columas_fechas): any
    {
        if ( searchText === '' )
        {
            return mainArr;
        }
​
        searchText = searchText.toLowerCase();
​
        return mainArr.filter(itemObj => {
            return this.searchInObj(itemObj, searchText,columas_fechas);
        });
    }

    /**
     * Search in object
     *
     * @param itemObj
     * @param searchText
     * @returns {boolean}
     */
    public static searchInObj(itemObj, searchText, columas_fechas): boolean
    {
        for ( const prop in itemObj )
        {
            if ( !itemObj.hasOwnProperty(prop) )
            {
                continue;
            }
​
            const value = itemObj[prop];
​
            if ( typeof value === 'string' )
            {
                if ( this.searchInString(value, searchText) )
                {
                    return true;
                }
            }
​
            if ( typeof value === 'number' )
            {
                if(columas_fechas.indexOf(prop) > -1){
                    let moment = require('moment');
                        if ( this.searchInString(moment(new Date(value)).format('DD/MM/YYYY'), searchText) )
                        {
                            return true;
                        }
                }else if ( this.searchInString(value.toString(), searchText) )
                {
                    return true;
                }
            }
​
            else if ( Array.isArray(value) )
            {
                if ( this.searchInArray(value, searchText, columas_fechas) )
                {
                    return true;
                }
            }
​
            if ( typeof value === 'object' )
            {
                if ( this.searchInObj(value, searchText, columas_fechas) )
                {
                    return true;
                }
            }
​
            if ( value instanceof Date )
            {
                if ( this.searchInString(value.toLocaleString(), searchText) )
                {
                    return true;
                }
            }
        }
    }

    /**
     * Search in array
     *
     * @param arr
     * @param searchText
     * @returns {boolean}
     */
    public static searchInArray(arr, searchText, columas_fechas): boolean
    {
        for ( const value of arr )
        {
            if ( typeof value === 'string' )
            {
                if ( this.searchInString(value, searchText) )
                {
                    return true;
                }
            }

            if ( typeof value === 'object' )
            {
                if ( this.searchInObj(value, searchText, columas_fechas) )
                {
                    return true;
                }
            }
        }
    }

    /**
     * Search in string
     *
     * @param value
     * @param searchText
     * @returns {any}
     */
    public static searchInString(value, searchText): any
    {
        return value.toLowerCase().includes(searchText);
    }

    /**
     * Generate a unique GUID
     *
     * @returns {string}
     */
    public static generateGUID(): string
    {
        function S4(): string
        {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }

        return S4() + S4();
    }

    /**
     * Toggle in array
     *
     * @param item
     * @param array
     */
    public static toggleInArray(item, array): void
    {
        if ( array.indexOf(item) === -1 )
        {
            array.push(item);
        }
        else
        {
            array.splice(array.indexOf(item), 1);
        }
    }

    /**
     * Handleize
     *
     * @param text
     * @returns {string}
     */
    public static handleize(text): string
    {
        return text.toString().toLowerCase()
                   .replace(/\s+/g, '-')           // Replace spaces with -
                   .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
                   .replace(/\-\-+/g, '-')         // Replace multiple - with single -
                   .replace(/^-+/, '')             // Trim - from start of text
                   .replace(/-+$/, '');            // Trim - from end of text
    }
}
