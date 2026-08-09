<?php

namespace ReportKit\Core\Table;

/**
 * Column definition for ReportTable / DataTables.
 */
class Column
{
    /** @var string */
    public $key;

    /** @var string */
    public $label;

    /** @var string */
    public $align = 'left';

    /** @var bool */
    public $sortable = false;

    /** @var string|null */
    public $width;

    /** @var string|null */
    public $className;

    /** @var array */
    public $badgeMap = [];

    /**
     * @param string $key
     * @param string $label
     * @return self
     */
    public static function make($key, $label = null)
    {
        $col = new self();
        $col->key = (string) $key;
        $col->label = $label !== null ? (string) $label : (string) $key;

        return $col;
    }

    /**
     * @return $this
     */
    public function sortable()
    {
        $this->sortable = true;

        return $this;
    }

    /**
     * @param string $align left|center|right
     * @return $this
     */
    public function align($align)
    {
        $this->align = (string) $align;

        return $this;
    }

    /**
     * @param array $map value => tone (good|bad|warn|muted)
     * @return $this
     */
    public function badge(array $map)
    {
        $this->badgeMap = $map;

        return $this;
    }

    /**
     * @return array
     */
    public function toArray()
    {
        return [
            'key' => $this->key,
            'label' => $this->label,
            'align' => $this->align,
            'sortable' => $this->sortable,
            'width' => $this->width,
            'className' => $this->className,
            'badgeMap' => $this->badgeMap,
        ];
    }
}
