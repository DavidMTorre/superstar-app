<?php

namespace App\Http\Requests\Api\V1\Peliculas;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Contracts\Validation\Validator;

class BuscarPeliculasRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'query' => $this->query('query'),
            'categoria' => $this->query('categoria'),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'query' => ['nullable', 'string', 'max:255'],
            'categoria' => ['nullable', 'string', 'max:100'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $q = $this->input('query');
            $c = $this->input('categoria');
            $tieneTitulo = is_string($q) && trim($q) !== '';
            $tieneCategoria = is_string($c) && trim($c) !== '';

            if (! $tieneTitulo && ! $tieneCategoria) {
                $validator->errors()->add(
                    'query',
                    'Debe indicar al menos un criterio de búsqueda (título o categoría).'
                );
            }
        });
    }

    /**
     * @return array{query?: string, categoria?: string}
     */
    public function filtrosBusqueda(): array
    {
        /** @var array<string, mixed> $v */
        $v = $this->validated();

        $out = [];
        if (isset($v['query']) && trim((string) $v['query']) !== '') {
            $out['query'] = trim((string) $v['query']);
        }
        if (isset($v['categoria']) && trim((string) $v['categoria']) !== '') {
            $out['categoria'] = trim((string) $v['categoria']);
        }

        return $out;
    }
}
