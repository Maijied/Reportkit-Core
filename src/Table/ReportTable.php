<?php

namespace ReportKit\Core\Table;

/**
 * DataTables / panel table definition.
 */
class ReportTable
{
    /** @var string */
    public $id;

    /** @var string */
    public $title = '';

    /** @var bool */
    public $serverSide = true;

    /** @var int */
    public $pageLength = 25;

    /** @var array */
    public $lengthMenu = [10, 25, 50, 100, -1];

    /** @var Column[] */
    public $columns = [];

    /**
     * @param string $id
     * @return self
     */
    public static function make($id)
    {
        $table = new self();
        $table->id = (string) $id;

        return $table;
    }

    /**
     * @param string $title
     * @return $this
     */
    public function title($title)
    {
        $this->title = (string) $title;

        return $this;
    }

    /**
     * @return $this
     */
    public function serverSide()
    {
        $this->serverSide = true;

        return $this;
    }

    /**
     * @param int $length
     * @return $this
     */
    public function pageLength($length)
    {
        $this->pageLength = (int) $length;

        return $this;
    }

    /**
     * @param array $menu
     * @return $this
     */
    public function lengthMenu(array $menu)
    {
        $this->lengthMenu = $menu;

        return $this;
    }

    /**
     * @param Column[]|array $columns
     * @return $this
     */
    public function columns(array $columns)
    {
        $this->columns = $columns;

        return $this;
    }

    /**
     * @return array
     */
    public function toArray()
    {
        $cols = [];

        foreach ($this->columns as $column) {
            $cols[] = $column instanceof Column ? $column->toArray() : $column;
        }

        return [
            'id' => $this->id,
            'title' => $this->title,
            'serverSide' => $this->serverSide,
            'pageLength' => $this->pageLength,
            'lengthMenu' => $this->lengthMenu,
            'columns' => $cols,
        ];
    }
}
